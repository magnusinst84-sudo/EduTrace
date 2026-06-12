import sys
import asyncio
from dotenv import load_dotenv

# Ensure environment is set to development for dev model chain
import os
os.environ["ENVIRONMENT"] = "development"

load_dotenv()

from utils.firebase_init import init_firebase
init_firebase()

from agent.state import WorldState
from db.sessions import save_session
from agent.handlers import run_diagnostic_turn, generate_roadmap, run_adaptive_turn

passed = 0
failed = 0

def print_result(name: str, success: bool, info: str = ""):
    global passed, failed
    if success:
        print(f"  PASS  {name} {f'({info})' if info else ''}")
        passed += 1
    else:
        print(f"  FAIL  {name} {f'({info})' if info else ''}")
        failed += 1

async def main():
    global passed, failed
    print("=" * 60)
    print("Day 5 -- Integration / Gemini Handler Tests")
    print("=" * 60)

    # 1. Setup a test session directly in Firestore
    state = WorldState(uid="test-user", topic="React")
    save_session(state)
    session_id = state.session_id
    print(f"Created test session {session_id} for topic 'React'\n")

    # TEST 1: First diagnostic turn
    try:
        res1 = await run_diagnostic_turn(session_id, "I know basic HTML and CSS")
        is_pass = res1.get("status") == "in_progress" and "question" in res1
        print_result("TEST 1: run_diagnostic_turn (turn 0)", is_pass, f"Question: {res1.get('question')}")
    except Exception as e:
        print_result("TEST 1: run_diagnostic_turn (turn 0)", False, str(e))

    # TEST 2: Second diagnostic turn
    try:
        res2 = await run_diagnostic_turn(session_id, "I want to get a frontend job")
        is_pass = res2.get("status") == "in_progress" and "question" in res2
        print_result("TEST 2: run_diagnostic_turn (turn 1)", is_pass, f"Question: {res2.get('question')}")
    except Exception as e:
        print_result("TEST 2: run_diagnostic_turn (turn 1)", False, str(e))

    # TEST 3: Third diagnostic turn (level inference)
    try:
        res3 = await run_diagnostic_turn(session_id, "About 10 hours per week")
        inferred_level = res3.get("level")
        is_pass = res3.get("status") == "complete" and inferred_level in ["beginner", "intermediate", "advanced"]
        print_result("TEST 3: run_diagnostic_turn (turn 2 - Complete)", is_pass, f"Level: {inferred_level}")
    except Exception as e:
        print_result("TEST 3: run_diagnostic_turn (turn 2 - Complete)", False, str(e))

    # TEST 4: Generate roadmap
    try:
        res4 = await generate_roadmap(session_id)
        roadmap = res4.get("roadmap", {})
        is_pass = res4.get("status") == "generated" and "weeks" in roadmap
        first_week_title = roadmap.get("weeks", [{}])[0].get("title", "") if roadmap.get("weeks") else ""
        print_result("TEST 4: generate_roadmap", is_pass, f"Total Weeks: {res4.get('total_weeks')}, Week 1 Title: {first_week_title}")
    except Exception as e:
        print_result("TEST 4: generate_roadmap", False, str(e))

    # TEST 5: First adaptive chat turn
    try:
        res5 = await run_adaptive_turn(session_id, "What should I focus on in week 1?")
        response_text = res5.get("response", "")
        is_pass = res5.get("status") == "ok" and len(response_text) > 50
        print_result("TEST 5: run_adaptive_turn (Normal)", is_pass, f"Response snippet: {response_text[:80]}...")
    except Exception as e:
        print_result("TEST 5: run_adaptive_turn (Normal)", False, str(e))

    # TEST 6: Second adaptive chat turn (stuck mode activation)
    try:
        res6 = await run_adaptive_turn(session_id, "I'm stuck on JSX")
        is_pass = res6.get("stuck_mode") is True
        print_result("TEST 6: run_adaptive_turn (Stuck Mode)", is_pass, f"Response snippet: {res6.get('response', '')[:80]}...")
    except Exception as e:
        print_result("TEST 6: run_adaptive_turn (Stuck Mode)", False, str(e))

    print("\n" + "=" * 60)
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed}")
    print("=" * 60)

    if failed:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
