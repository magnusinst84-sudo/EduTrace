import json
import re
import asyncio
import logging
from agent.state import WorldState
from middleware.sanitize import sanitize_message
from agent.prompts import (
    build_diagnostic_prompt,
    build_level_inference_prompt,
    build_roadmap_prompt,
    build_adaptive_prompt,
    build_quiz_prompt,
    build_quiz_grading_prompt,
)
from agent.gemini import gemini_call
from agent.loader import get_topic_slug, build_prompt_context

logger = logging.getLogger(__name__)


def _clean_json_markdown(text: str) -> str:
    """Strip markdown code fences before json.loads()."""
    if text is None:
        return None
    text = re.sub(r'^```(?:json)?\s*', '', text.strip())
    text = re.sub(r'\s*```$', '', text.strip())
    start = min(
        (text.find('{') if text.find('{') != -1 else len(text)),
        (text.find('[') if text.find('[') != -1 else len(text))
    )
    end = max(text.rfind('}'), text.rfind(']'))
    if start < len(text) and end != -1:
        text = text[start:end+1]
    return text.strip()


async def run_diagnostic_turn(session_id: str, user_answer: str) -> dict:
    from db.sessions import load_session, save_session
    loaded_dict = load_session(session_id)
    if loaded_dict is None:
        raise ValueError("Session not found")

    state = WorldState(**loaded_dict)
    if state.diagnostic_complete:
        return {"status": "already_complete", "level": state.level}

    user_answer = sanitize_message(user_answer)
    state.diagnostic_answers.append(user_answer)
    state.conversation_history.append({
        "role": "user",
        "content": user_answer,
        "turn": state.diagnostic_turn
    })

    if state.diagnostic_turn < 2:
        next_turn = state.diagnostic_turn + 1
        prompt = build_diagnostic_prompt(state.to_dict(), next_turn)
        question = await gemini_call(prompt, json_mode=False)

        state.conversation_history.append({
            "role": "assistant",
            "content": question,
            "turn": next_turn
        })
        state.diagnostic_turn = next_turn
        save_session(state)
        return {
            "status": "in_progress",
            "turn": state.diagnostic_turn,
            "question": question
        }
    else:
        state.diagnostic_complete = True
        prompt = build_level_inference_prompt(state.to_dict())
        response_text = await gemini_call(prompt, json_mode=True)
        try:
            parsed = json.loads(_clean_json_markdown(response_text))
            state.level = parsed.get("level", "beginner")
        except Exception:
            state.level = "beginner"

        state.conversation_history.append({
            "role": "system",
            "content": f"Level inferred: {state.level}"
        })
        save_session(state)
        return {
            "status": "complete",
            "level": state.level,
            "session_id": session_id
        }


async def generate_roadmap(session_id: str) -> dict:
    from db.sessions import load_session, save_session
    loaded_dict = load_session(session_id)
    if loaded_dict is None:
        raise ValueError("Session not found")

    state = WorldState(**loaded_dict)
    if not state.diagnostic_complete:
        raise ValueError("Diagnostic not complete")

    if state.roadmap_generated:
        return {"status": "already_generated", "roadmap": state.roadmap}

    topic_slug = get_topic_slug(state.topic)
    context = build_prompt_context(topic_slug, state.level)
    prompt = build_roadmap_prompt(state.to_dict(), context)

    parsed = None
    for attempt in range(1, 4):
        # Use gemini_call directly (no search grounding) for speed
        response_text = await gemini_call(prompt, json_mode=False, max_tokens=4096)

        try:
            parsed = json.loads(_clean_json_markdown(response_text))
            if attempt > 1:
                logger.info(f"Roadmap generation succeeded on attempt {attempt}")
            break
        except (json.JSONDecodeError, ValueError) as e:
            if attempt < 3:
                logger.warning(f"Roadmap generation attempt {attempt} failed to parse as JSON, retrying...")
            else:
                raise ValueError(f"Roadmap generation failed: Gemini returned malformed JSON. Raw: {response_text[:200]}") from e

    state.roadmap = parsed
    state.roadmap_generated = True
    state.total_weeks = parsed.get("total_weeks", 8)
    state.current_week = 1
    state.topic_slug = topic_slug

    save_session(state)
    return {
        "status": "generated",
        "roadmap": state.roadmap,
        "total_weeks": state.total_weeks
    }


async def run_adaptive_turn(session_id: str, user_message: str) -> dict:
    from db.sessions import load_session, save_session
    loaded_dict = load_session(session_id)
    if loaded_dict is None:
        raise ValueError("Session not found")

    state = WorldState(**loaded_dict)
    if not state.roadmap_generated:
        raise ValueError("Roadmap not generated")

    user_message = sanitize_message(user_message)

    stuck_keywords = ["i'm stuck", "im stuck", "i am stuck", "don't understand",
                      "dont understand", "confused", "not getting it"]
    understood_keywords = ["got it", "understood", "makes sense", "i understand",
                           "clear now", "next topic", "move on"]
    advance_exact = ["advance week", "next week"]
    advance_keywords = ["i'm ready for the next week", "im ready for the next week",
                        "let's move to next week", "lets move to next week", "ready to move on to week"]

    msg_lower = user_message.lower().strip()
    words = msg_lower.split()

    new_mode = None
    if any(phrase in msg_lower for phrase in ["switch to analogy", "use analogy", "analogy mode"]):
        new_mode = "analogy"
    elif any(phrase in msg_lower for phrase in ["switch to socratic", "socratic mode"]):
        new_mode = "socratic"
    elif any(phrase in msg_lower for phrase in ["switch to code", "code example mode", "code mode"]):
        new_mode = "code_example"

    if new_mode:
        state.teaching_mode = new_mode
        if new_mode == "analogy":
            response = "Switched to Analogy mode! I'll explain concepts using real-world comparisons from now on."
        elif new_mode == "socratic":
            response = "Switched to Socratic mode! I'll guide you with questions from now on."
        elif new_mode == "code_example":
            response = "Switched to Code Example mode! I'll explain concepts using working code snippets from now on."

        state.conversation_history.append({"role": "user", "content": user_message})
        state.conversation_history.append({"role": "assistant", "content": response})
        state.conversation_history = state.conversation_history[-20:]

        save_session(state)
        return {
            "status": "ok",
            "response": response,
            "stuck_mode": state.stuck_mode_active,
            "current_week": state.current_week,
            "total_weeks": state.total_weeks,
            "week_advanced": False
        }

    has_negation = any(neg in words for neg in ["no", "dont", "don't"]) or "not ready" in msg_lower or "not yet" in msg_lower
    wants_advance = (msg_lower in advance_exact) or (any(kw in msg_lower for kw in advance_keywords) and not has_negation)
    week_advanced = False

    if wants_advance:
        if state.current_week < state.total_weeks:
            quiz_passed_this_week = state.quiz_passed.get(str(state.current_week), False)
            if not quiz_passed_this_week:
                response = f"You'll need to pass this week's quiz before moving on. When you're ready, just ask me to start your Week {state.current_week} quiz."
            else:
                state.current_week += 1
                week_advanced = True
                response = f"Welcome to Week {state.current_week}! You're making great progress. What would you like to dive into first?"
        else:
            response = "You have reached the final week and completed the roadmap! Great job!"

        state.stuck_mode_active = False
    else:
        if any(kw in msg_lower for kw in stuck_keywords):
            state.stuck_mode_active = True
        if any(kw in msg_lower for kw in understood_keywords):
            state.stuck_mode_active = False

        prompt = build_adaptive_prompt(state.to_dict(), user_message)
        response = await gemini_call(prompt, json_mode=False)

    state.conversation_history.append({"role": "user", "content": user_message})
    state.conversation_history.append({"role": "assistant", "content": response})
    state.conversation_history = state.conversation_history[-20:]

    save_session(state)
    return {
        "status": "ok",
        "response": response,
        "stuck_mode": state.stuck_mode_active,
        "current_week": state.current_week,
        "total_weeks": state.total_weeks,
        "week_advanced": week_advanced
    }


async def generate_quiz(session_id: str) -> dict:
    from db.sessions import load_session, save_session
    loaded_dict = load_session(session_id)
    if loaded_dict is None:
        raise ValueError("Session not found")

    state = WorldState(**loaded_dict)
    if not state.roadmap_generated:
        raise ValueError("Roadmap not generated")

    weeks = state.roadmap.get("weeks", [])
    week_data = next((w for w in weeks if w.get("week") == state.current_week), None)
    if not week_data:
        raise ValueError(f"Week {state.current_week} not found in roadmap")

    prompt = build_quiz_prompt(state.to_dict())

    parsed = None
    for attempt in range(1, 4):
        response_text = await gemini_call(prompt, json_mode=True, max_tokens=2048)
        try:
            parsed = json.loads(_clean_json_markdown(response_text))
            if attempt > 1:
                logger.info(f"Quiz generation succeeded on attempt {attempt}")
            break
        except (json.JSONDecodeError, ValueError) as e:
            if attempt < 3:
                logger.warning(f"Quiz generation attempt {attempt} failed to parse as JSON, retrying...")
            else:
                raise ValueError(f"Quiz generation failed: Gemini returned malformed JSON. Raw: {response_text[:200]}") from e

    state.current_quiz = parsed
    save_session(state)

    return {
        "status": "generated",
        "quiz": state.current_quiz
    }


async def grade_quiz(session_id: str, user_answers: dict) -> dict:
    from db.sessions import load_session, save_session
    loaded_dict = load_session(session_id)
    if loaded_dict is None:
        raise ValueError("Session not found")

    state = WorldState(**loaded_dict)
    if not state.current_quiz:
        raise ValueError("No quiz generated yet for this session")

    prompt = build_quiz_grading_prompt(state.current_quiz, user_answers)

    parsed = None
    for attempt in range(1, 4):
        response_text = await gemini_call(prompt, json_mode=True, max_tokens=2048)
        try:
            parsed = json.loads(_clean_json_markdown(response_text))
            if attempt > 1:
                logger.info(f"Quiz grading succeeded on attempt {attempt}")
            break
        except (json.JSONDecodeError, ValueError) as e:
            if attempt < 3:
                logger.warning(f"Quiz grading attempt {attempt} failed to parse as JSON, retrying...")
            else:
                raise ValueError(f"Quiz grading failed: Gemini returned malformed JSON. Raw: {response_text[:200]}") from e

    state.quiz_passed[str(state.current_week)] = parsed.get("passed", False)
    save_session(state)

    return {
        "status": "graded",
        "result": parsed
    }