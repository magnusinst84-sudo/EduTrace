"""Prompt builders for EduTrace's multi-phase learning agent.

All functions return plain strings — no LLM calls are made here.
"""

import json


def build_diagnostic_prompt(state: dict, turn: int) -> str:
    topic = state["topic"]
    answers = state.get("diagnostic_answers", [])

    base = f"You are EduTrace. Onboarding a learner for: {topic}.\n"
    if answers:
        base += "Their answers so far:\n"
        for i, a in enumerate(answers):
            base += f"  Turn {i+1}: {a}\n"

    # turn is 0-indexed: 0 = first question, 1 = second, 2 = third
    if turn == 0:
        base += f"\nAsk what they already know about {topic}."
    elif turn == 1:
        base += "\nAsk what their learning goal is (job, project, exam, or curiosity)."
    else:
        base += "\nAsk how many hours per week they can dedicate."

    base += "\n\nRules — strictly follow these:"
    base += "\n- Output ONLY the question. Nothing else."
    base += "\n- One sentence. Conversational. No formal language."
    base += "\n- No greeting, no intro, no 'I am EduTrace', no sign-off."
    base += "\n- No bullet points, no numbered lists, no markdown."
    base += "\nBAD: 'Hello! I am EduTrace, your adaptive learning partner...'"
    base += "\nGOOD: 'What do you already know about React?'"

    return base


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
    diagnostic_answers = state.get("diagnostic_answers", [])
    user_goal = diagnostic_answers[1] if len(diagnostic_answers) > 1 else ""
    user_hours = diagnostic_answers[2] if len(diagnostic_answers) > 2 else ""

    week_counts = {"beginner": 8, "intermediate": 6, "advanced": 4}
    weeks = week_counts.get(level, 8)

    parts: list[str] = [
        f"Create a {weeks}-week learning roadmap for {topic} at the {level} level."
    ]

    if user_goal:
        parts.append(
            f"\nUSER GOAL: The user's stated learning goal is: '{user_goal}'. "
            "Frame the weekly 'goal' field and resource choices around this goal specifically. "
            "For example, if the goal mentions 'job' or 'interview', reference real-world/interview relevance where it fits naturally."
        )

    if user_hours:
        parts.append(
            f"\nTIME BUDGET: The user can dedicate '{user_hours}' per week. "
            "Size the weekly workload realistically for this time budget. "
            f"If the hours are low, you may EXTEND total_weeks beyond the default of {weeks} weeks rather than overloading each week. "
            "If hours are high, you may also REDUCE total_weeks if the full curriculum fits in fewer, denser weeks. "
            "Choose whatever total_weeks value actually fits — it does not need to match the default."
        )

    if context:
        parts.append(
            "\nUse BOTH the provided roadmap.sh grounding material below AND your own Google Search web results. "
            "For each topic, compare the sources and prefer whichever specific resource (whether from roadmap.sh or the web) is more relevant, current, or high-quality. "
            "Do not default to just one source type; mix them to create the best roadmap possible.\n\n"
            f"{context}"
        )

    parts.append(
        "\n\nIMPORTANT: Use the EXACT URLs from the roadmap context above. "
        "Do not invent, modify, or shorten any URLs. "
        "If a resource comes from your own web search rather than the roadmap.sh context, use the exact URL returned by the search tool — do not modify, shorten, or paraphrase it either. "
        "If no URL exists for a resource, omit that resource entirely.\n"
        "\nReturn ONLY this JSON — no markdown, no explanation:\n"
        "{\n"
        '  "weeks": [\n'
        "    {\n"
        '      "week": 1,\n'
        '      "title": "Week title",\n'
        '      "topics": ["topic1", "topic2"],\n'
        '      "resources": [\n'
        '        {"title": "Resource name", "url": "https://...", "type": "article|video|docs"}\n'
        '      ],\n'
        '      "goal": "By end of this week you will..."\n'
        "    }\n"
        "  ],\n"
        '  "total_weeks": <number, your choice based on time budget — see TIME BUDGET instruction above>,\n'
        '  "summary": "One sentence overview of the full roadmap"\n'
        "}"
    )

    parts.append(
        "\n\nCRITICAL: Your entire response must be ONLY the raw JSON object shown above. "
        "Do NOT use markdown formatting. Do NOT use bullet points, asterisks, or bold text. "
        "Do NOT include any explanatory text, headers, or commentary before or after the JSON. "
        "Your response must start with the character { and end with the character }. "
        "If you include anything else, the response will fail to parse and break the application."
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

    teaching_mode = state.get("teaching_mode", "analogy")
    if teaching_mode == "analogy":
        parts.append("Explain concepts using real-world analogies and comparisons. Make abstract ideas concrete by relating them to everyday experiences.")
    elif teaching_mode == "socratic":
        parts.append("Use the Socratic method. Instead of giving direct answers, guide the user to discover answers themselves through targeted questions. Ask one focused question at a time.")
    elif teaching_mode == "code_example":
        parts.append("Explain concepts primarily through working code examples. Show don't tell — lead with a concrete code snippet, then explain what it does and why.")

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

    prompt = "\n".join(parts)

    prompt += "\n\nResponse rules:"
    prompt += "\n- Short paragraphs, max 3."
    prompt += "\n- Under 80 words unless user asks for detail."
    prompt += "\n- No bullet points unless listing actual steps."
    prompt += "\n- Conversational tone, not a textbook."

    return prompt


def build_quiz_prompt(state: dict) -> str:
    topic = state.get("topic", "this topic")
    level = state.get("level", "beginner")
    current_week = state.get("current_week", 1)
    
    roadmap = state.get("roadmap", {})
    weeks = roadmap.get("weeks", [])
    week_data = next((w for w in weeks if w.get("week") == current_week), {})
    week_title = week_data.get("title", "")
    week_topics = week_data.get("topics", [])
    
    parts = [
        f"You are EduTrace, generating a quiz for a {level} learner studying {topic}.",
        f"The user is currently on Week {current_week}: {week_title}.",
        "Your task is to generate a quiz that strictly tests ONLY the concepts from THIS week.",
        f"The topics covered this week are: {', '.join(week_topics)}.",
        "\nDecide the appropriate NUMBER of questions and the MIX of question types (multiple_choice, short_answer, code) based on these topics.",
        "If this week's topics are coding-heavy, lean towards 'code' questions. If they are conceptual, lean towards 'multiple_choice' and 'short_answer'.",
        "\nReturn ONLY this JSON schema:",
        "{\n"
        '  "week": <number>,\n'
        '  "questions": [\n'
        "    {\n"
        '      "id": "q1",\n'
        '      "type": "multiple_choice",\n'
        '      "question": "...",\n'
        '      "options": ["A", "B", "C", "D"],\n'
        '      "correct_answer": "A"\n'
        "    },\n"
        "    {\n"
        '      "id": "q2", \n'
        '      "type": "short_answer",\n'
        '      "question": "...",\n'
        '      "correct_answer": "expected answer or key points to check for"\n'
        "    },\n"
        "    {\n"
        '      "id": "q3",\n'
        '      "type": "code",\n'
        '      "question": "...",\n'
        '      "correct_answer": "expected approach or solution description"\n'
        "    }\n"
        "  ]\n"
        "}",
        "\nFor 'multiple_choice' questions, the 'options' field is REQUIRED. "
        "For 'short_answer' and 'code' questions, OMIT the 'options' field entirely.",
        "\n\nCRITICAL: Your entire response must be ONLY the raw JSON object shown above. "
        "Do NOT use markdown formatting. Do NOT use bullet points, asterisks, or bold text. "
        "Do NOT include any explanatory text, headers, or commentary before or after the JSON. "
        "Your response must start with the character { and end with the character }. "
        "If you include anything else, the response will fail to parse and break the application."
    ]
    return "\n".join(parts)


def build_quiz_grading_prompt(quiz: dict, user_answers: dict) -> str:
    parts = [
        "You are EduTrace, an expert teacher grading a student's quiz.",
        "Below is the original quiz and the student's submitted answers.",
        "\n--- QUIZ ---",
    ]
    
    questions = quiz.get("questions", [])
    for q in questions:
        qid = q.get("id")
        qtype = q.get("type")
        qtext = q.get("question")
        correct = q.get("correct_answer")
        
        user_ans = user_answers.get(qid, "No answer provided")
        
        parts.append(f"\nQuestion ID: {qid} ({qtype})")
        parts.append(f"Question text: {qtext}")
        parts.append(f"Expected/Correct answer: {correct}")
        parts.append(f"Student's answer: {user_ans}")

    parts.extend([
        "\n--- GRADING INSTRUCTIONS ---",
        "1. Grade holistically based on demonstrated understanding, not just rigid string matches.",
        "   - For 'multiple_choice', check if their selected option matches the correct one.",
        "   - For 'short_answer' and 'code', judge whether their answer is fundamentally correct even if the wording or specific code differs from the expected answer.",
        "2. Decide an OVERALL pass/fail for the entire quiz based on their overall demonstrated understanding across all questions.",
        "   - Do NOT use a rigid percentage threshold. If they got the core concepts right but missed a tiny detail, they pass. If they fundamentally misunderstood key topics, they fail.",
        "\nReturn ONLY this JSON schema:",
        "{\n"
        '  "passed": true,\n'
        '  "overall_feedback": "one or two sentence summary",\n'
        '  "per_question": [\n'
        '    {"id": "q1", "correct": true, "feedback": "short explanation"},\n'
        '    {"id": "q2", "correct": false, "feedback": "short explanation"}\n'
        "  ]\n"
        "}",
        "\n\nCRITICAL: Your entire response must be ONLY the raw JSON object shown above. "
        "Do NOT use markdown formatting. Do NOT use bullet points, asterisks, or bold text. "
        "Do NOT include any explanatory text, headers, or commentary before or after the JSON. "
        "Your response must start with the character { and end with the character }. "
        "If you include anything else, the response will fail to parse and break the application."
    ])
    
    return "\n".join(parts)