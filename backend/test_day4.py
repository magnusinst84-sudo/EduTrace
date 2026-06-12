"""Day 4 tests -- loader and prompt builders."""

import sys
sys.path.insert(0, ".")

from agent.loader import load_roadmap, build_prompt_context
from agent.prompts import (
    build_diagnostic_prompt,
    build_level_inference_prompt,
    build_roadmap_prompt,
    build_adaptive_prompt,
)

passed = 0
failed = 0


def run_test(name: str, condition: bool):
    global passed, failed
    if condition:
        print(f"  PASS  {name}")
        passed += 1
    else:
        print(f"  FAIL  {name}")
        failed += 1


print("=" * 55)
print("Day 4 -- Loader & Prompt Builder Tests")
print("=" * 55)

# ── loader tests ───────────────────────────────────────────────────────
print("\nloader.py:")

react = load_roadmap("react")
run_test(
    'load_roadmap("react") returns dict with "nodes" key and len > 5',
    react is not None and isinstance(react, dict)
    and "nodes" in react and len(react["nodes"]) > 5,
)

ctx = build_prompt_context("react", "beginner")
run_test(
    'build_prompt_context("react", "beginner") contains "ROADMAP CONTEXT"',
    "ROADMAP CONTEXT" in ctx,
)

none_result = load_roadmap("nonexistent-topic-xyz")
run_test(
    'load_roadmap("nonexistent-topic-xyz") returns None',
    none_result is None,
)

empty_ctx = build_prompt_context("nonexistent-topic-xyz", "beginner")
run_test(
    'build_prompt_context("nonexistent-topic-xyz", "beginner") returns ""',
    empty_ctx == "",
)

# ── prompts tests ──────────────────────────────────────────────────────
print("\nprompts.py:")

state = {
    "uid": "test",
    "topic": "React",
    "level": "beginner",
    "diagnostic_answers": ["I know basics", "job prep", "10 hours/week"],
    "current_week": 1,
    "total_weeks": 8,
    "conversation_history": [],
    "stuck_mode_active": False,
    "concepts_understood": [],
    "concepts_stuck": [],
}

d0 = build_diagnostic_prompt(state, 0)
run_test("build_diagnostic_prompt(state, 0) returns non-empty string", bool(d0))

d1 = build_diagnostic_prompt(state, 1)
run_test("build_diagnostic_prompt(state, 1) returns non-empty string", bool(d1))

d2 = build_diagnostic_prompt(state, 2)
run_test("build_diagnostic_prompt(state, 2) returns non-empty string", bool(d2))

level_prompt = build_level_inference_prompt(state)
run_test(
    'build_level_inference_prompt(state) contains level keywords',
    any(kw in level_prompt for kw in ("beginner", "intermediate", "advanced")),
)

roadmap_prompt = build_roadmap_prompt(state, "")
run_test("build_roadmap_prompt(state, '') returns non-empty string", bool(roadmap_prompt))

adaptive_prompt = build_adaptive_prompt(state, "what should I learn first?")
run_test(
    'build_adaptive_prompt(state, "what should I learn first?") returns non-empty string',
    bool(adaptive_prompt),
)

# ── Summary ────────────────────────────────────────────────────────────
print("\n" + "=" * 55)
print(f"Results: {passed} passed, {failed} failed out of {passed + failed}")
print("=" * 55)

if failed:
    sys.exit(1)
