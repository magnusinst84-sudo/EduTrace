"""Prompt builders for EduTrace's multi-phase learning agent.

All functions return plain strings — no LLM calls are made here.
"""

import json


def build_diagnostic_prompt(state: dict, turn: int) -> str:
    """Build a single diagnostic question for the given turn number."""
    topic = state.get("topic", "this topic")
    header = f"You are EduTrace, an adaptive learning agent for {topic}."

    questions = {
        0: f"Tell me what you already know about {topic} — anything from complete beginner to experienced practitioner.",
        1: "What's driving you to learn this right now — is it for a project, a job interview, an exam, or just curiosity?",
        2: "Roughly how many hours per week can you set aside for studying this?",
    }

    question = questions.get(turn, questions[0])
    return f"{header}\n\n{question}"


def build_level_inference_prompt(state: dict) -> str:
    """Ask the LLM to infer beginner/intermediate/advanced from diagnostic answers."""
    topic = state.get("topic", "this topic")
    answers = state.get("diagnostic_answers", [])

    answers_text = "\n".join(
        f"- Q{i + 1}: {a}" for i, a in enumerate(answers)
    )

    return (
        f"Based on the following diagnostic responses about {topic}:\n\n"
        f"{answers_text}\n\n"
        "Classify the learner's current level. "
        'Return ONLY this JSON — no markdown, no explanation:\n'
        '{"level": "beginner|intermediate|advanced", "reasoning": "one sentence"}'
    )


def build_roadmap_prompt(state: dict, context: str) -> str:
    """Ask the LLM to generate a weekly learning roadmap."""
    topic = state.get("topic", "this topic")
    level = state.get("level", "beginner")

    week_counts = {"beginner": 8, "intermediate": 6, "advanced": 4}
    weeks = week_counts.get(level, 8)

    parts: list[str] = [
        f"Create a {weeks}-week learning roadmap for {topic} at the {level} level."
    ]

    if context:
        parts.append(
            "\nUse the following roadmap.sh topics and resources as your "
            "grounding material. Prefer these resources over others.\n\n"
            f"{context}"
        )

    parts.append(
        "\n\nReturn ONLY this JSON — no markdown, no explanation:\n"
        "{\n"
        '  "weeks": [\n'
        "    {\n"
        '      "week": 1,\n'
        '      "title": "...",\n'
        '      "topics": ["..."],\n'
        '      "resources": ["url1", "url2"],\n'
        '      "goal": "By end of this week you will..."\n'
        "    }\n"
        "  ],\n"
        f'  "total_weeks": {weeks},\n'
        '  "summary": "..."\n'
        "}"
    )

    return "\n".join(parts)


def build_adaptive_prompt(state: dict, user_message: str) -> str:
    """Build a contextual prompt for the ongoing tutoring conversation."""
    topic = state.get("topic", "this topic")
    level = state.get("level", "beginner")
    current_week = state.get("current_week", 1)
    total_weeks = state.get("total_weeks", 8)
    understood = state.get("concepts_understood", [])
    stuck = state.get("concepts_stuck", [])
    stuck_mode = state.get("stuck_mode_active", False)
    history = state.get("conversation_history", [])

    parts: list[str] = [
        f"You are EduTrace, an adaptive learning agent for {topic}.",
        f"Learner level: {level}.",
        f"Progress: week {current_week} of {total_weeks}.",
    ]

    if understood:
        parts.append(f"Concepts understood: {', '.join(understood)}.")
    if stuck:
        parts.append(f"Concepts the learner is stuck on: {', '.join(stuck)}.")

    if stuck_mode:
        parts.append(
            "The user is stuck. Focus on re-explaining the current concept "
            "in a simpler way. Suggest one specific resource."
        )

    # Last 10 turns of history
    recent = history[-10:] if history else []
    if recent:
        parts.append("\n--- Recent conversation ---")
        for turn in recent:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            parts.append(f"{role}: {content}")

    parts.append(f"\nUser: {user_message}")
    parts.append("\nRespond in plain conversational text. Do not return JSON.")

    return "\n".join(parts)
