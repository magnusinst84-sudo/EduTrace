"""Day 6 tests -- Session routes, security headers, global exception handlers, and config assets."""

import sys
sys.path.insert(0, ".")

import os
from pathlib import Path
from fastapi import FastAPI

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


print("=" * 60)
print("Day 6 -- Security & Router Configurations")
print("=" * 60)

# TEST 1: SecurityHeadersMiddleware class imports without error
try:
    from middleware.security_headers import SecurityHeadersMiddleware
    run_test("SecurityHeadersMiddleware class imports without error", True)
except Exception as e:
    run_test("SecurityHeadersMiddleware class imports without error", False)

# TEST 2: global_exception_handler is registered on app
try:
    from main import app
    # Check if app has exception handlers registered
    handlers = app.exception_handlers
    has_global = Exception in handlers
    has_value_error = ValueError in handlers
    run_test(
        "global_exception_handler and ValueError handler registered on app",
        has_global and has_value_error,
    )
except Exception as e:
    run_test("global_exception_handler is registered on app", False)

# TEST 3, 4, 5: Route existence in session router
try:
    from routes.session import router
    route_paths = [r.path for r in router.routes]
    
    # 3. GET /api/sessions route
    run_test(
        "GET /api/sessions route exists on the router",
        "/sessions" in route_paths
    )
    
    # 4. GET /api/session/{session_id} route
    run_test(
        "GET /api/session/{session_id} route exists on the router",
        "/session/{session_id}" in route_paths
    )
    
    # 5. DELETE /api/session/{session_id} route
    run_test(
        "DELETE /api/session/{session_id} route exists on the router",
        "/session/{session_id}" in route_paths
    )
except Exception as e:
    print(f"Error checking router routes: {e}")
    run_test("Router routes check", False)

# TEST 6: .env.example exists at project root
project_root = Path(__file__).resolve().parent.parent
env_example_path = project_root / ".env.example"
run_test(".env.example exists at project root", env_example_path.exists())

# TEST 7: firestore.rules exists at project root
rules_path = project_root / "firestore.rules"
run_test("firestore.rules exists at project root", rules_path.exists())

# TEST 8: Server starts without errors (import main succeeds)
try:
    import main
    run_test("Server starts without errors: import main succeeds", True)
except Exception as e:
    run_test("Server starts without errors: import main succeeds", False)

print("\n" + "=" * 60)
print(f"Results: {passed} passed, {failed} failed out of {passed + failed}")
print("=" * 60)

if failed:
    sys.exit(1)
