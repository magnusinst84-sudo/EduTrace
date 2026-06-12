import json
import asyncio
from agent.state import WorldState
from middleware.sanitize import sanitize_message
from agent.prompts import (
    build_diagnostic_prompt,
    build_level_inference_prompt,
    build_roadmap_prompt,
    build_adaptive_prompt,
)
from agent.gemini import gemini_call
from agent.loader import get_topic_slug, build_prompt_context

def _clean_json_markdown(text: str) -> str:
    """Strip markdown code fences before json.loads()."""
    return text.strip().lstrip("```json").lstrip("```").rstrip("```").strip()

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
            # Fallback if parsing fails
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
    response_text = await gemini_call(prompt, json_mode=True)
    
    parsed = json.loads(_clean_json_markdown(response_text))
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
    
    stuck_keywords = ["i'm stuck", "im stuck", "i am stuck", "don't understand", "dont understand", "confused", "not getting it"]
    understood_keywords = ["got it", "understood", "makes sense", "i understand", "clear now", "next topic", "move on"]
    
    msg_lower = user_message.lower()
    if any(kw in msg_lower for kw in stuck_keywords):
        state.stuck_mode_active = True
    if any(kw in msg_lower for kw in understood_keywords):
        state.stuck_mode_active = False
        
    prompt = build_adaptive_prompt(state.to_dict(), user_message)
    response = await gemini_call(prompt, json_mode=False)
    
    state.conversation_history.append({"role": "user", "content": user_message})
    state.conversation_history.append({"role": "assistant", "content": response})
    
    # Keep last 20 entries
    state.conversation_history = state.conversation_history[-20:]
    
    save_session(state)
    return {
        "status": "ok",
        "response": response,
        "stuck_mode": state.stuck_mode_active,
        "current_week": state.current_week
    }
