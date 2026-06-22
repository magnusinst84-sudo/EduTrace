import httpx
import json
import sys

TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImVlOTA0NmVhZDJlMDUwMDAxMGVkNTA0M2I0ODNkODRiMGM1MmM3YzQiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoibWFnbnVzIGluc3QiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSlk3dk05RzBQb3lLcTBOS1A2Z2NtSUdYY0M0NVhZWEZ5VzhNbFNUdTFKeUhIVj1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9lZHV0cmFjZS1mMWYyYSIsImF1ZCI6ImVkdXRyYWNlLWYxZjJhIiwiYXV0aF90aW1lIjoxNzgyMTM1OTcxLCJ1c2VyX2lkIjoiSWYxSXlVcG5KNWFDMXlXT1Y3ZUdkdXBuSG50MiIsInN1YiI6IklmMUl5VXBuSjVhQzF5V09WN2VHZHVwbkhudDIiLCJpYXQiOjE3ODIxMzU5NzEsImV4cCI6MTc4MjEzOTU3MSwiZW1haWwiOiJtYWdudXNpbnN0ODRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMDQ1OTkzNTE1OTg3OTkzMDI4ODciXSwiZW1haWwiOlsibWFnbnVzaW5zdDg0QGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.Wi_sh7xZNNyMRvcOkLm-uYYKHlmmbf-V7yHwHpHqQ17_fcu19e9Csu7_dIsrjTFPQdYt-7fR7DSULpobAAAss_zAhgWwkCuS5ZoSCocnnkXiaqtzRN8RLkTJNwdhj5HCKB6Snor8OR8geRQ9m27-DQjoeHWqdbYeMJ56ATUfR4RMP5TSee9mNvZ-igURRb0r6CDjHsWOo_mefqXetL9XhYbXsW1IrTPbTkP0Zr9sKpHQLw1VvftdRHuXoE7aZnBb6RzOs3o1equdrqIVP9e8XH-Q-X5UIzBmIs1ddUmIYpdUQTPm9LbJnz1kZlwvnRxdZ5fEH0cxV6FsXJ59Fe2d-g"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
SESSION_ID = "d80dccdd-e2da-4fef-8c2e-d8ba0be1286a"
BASE_URL = "http://localhost:8000/api"

def main():
    print(f"=== 1. Requesting Quiz Generation for session {SESSION_ID} ===")
    
    try:
        gen_resp = httpx.post(f"{BASE_URL}/session/{SESSION_ID}/quiz", headers=HEADERS, timeout=60.0)
    except Exception as e:
        print(f"HTTP Request to {BASE_URL} failed: {e}")
        sys.exit(1)
        
    print(f"Status Code: {gen_resp.status_code}")
    
    if gen_resp.status_code != 200:
        print("Generation failed!")
        print(gen_resp.text)
        return
        
    gen_data = gen_resp.json()
    print("=== Raw Generation Response ===")
    print(json.dumps(gen_data, indent=2))
    
    quiz = gen_data.get("quiz", {})
    questions = quiz.get("questions", [])
    
    if not questions:
        print("No questions returned in the quiz object.")
        return
        
    print("\n=== 2. Building Placeholder Answers ===")
    user_answers = {}
    for q in questions:
        qid = q.get("id")
        qtype = q.get("type")
        if qtype == "multiple_choice":
            # Just take the first option if available
            opts = q.get("options", ["A"])
            user_answers[qid] = opts[0]
        else:
            user_answers[qid] = "test answer"
            
    print("User Answers payload:")
    print(json.dumps({"answers": user_answers}, indent=2))
    
    print("\n=== 3. Requesting Quiz Grading ===")
    try:
        submit_resp = httpx.post(
            f"{BASE_URL}/session/{SESSION_ID}/quiz/submit", 
            json={"answers": user_answers}, 
            headers=HEADERS, 
            timeout=60.0
        )
    except Exception as e:
        print(f"HTTP Request failed: {e}")
        sys.exit(1)
        
    print(f"Status Code: {submit_resp.status_code}")
    
    if submit_resp.status_code != 200:
        print("Submit failed!")
        print(submit_resp.text)
        return
        
    print("=== Raw Grading Response (Bad Answers) ===")
    print(json.dumps(submit_resp.json(), indent=2))

    print("\n=== 4. Building Good Answers ===")
    good_answers = {}
    for q in questions:
        qid = q.get("id")
        good_answers[qid] = q.get("correct_answer", "")
        
    print("Good Answers payload:")
    print(json.dumps({"answers": good_answers}, indent=2))
    
    print("\n=== 5. Requesting Quiz Grading (Good Answers) ===")
    try:
        submit_good_resp = httpx.post(
            f"{BASE_URL}/session/{SESSION_ID}/quiz/submit", 
            json={"answers": good_answers}, 
            headers=HEADERS, 
            timeout=60.0
        )
    except Exception as e:
        print(f"HTTP Request failed: {e}")
        sys.exit(1)
        
    print(f"Status Code: {submit_good_resp.status_code}")
    if submit_good_resp.status_code != 200:
        print("Submit (good answers) failed!")
        print(submit_good_resp.text)
        return
        
    print("=== Raw Grading Response (Good Answers) ===")
    print(json.dumps(submit_good_resp.json(), indent=2))
    
    print("\n=== 6. Fetching Session to Verify Persistence ===")
    try:
        session_resp = httpx.get(f"{BASE_URL}/session/{SESSION_ID}", headers=HEADERS, timeout=60.0)
    except Exception as e:
        print(f"HTTP Request failed: {e}")
        sys.exit(1)
        
    print(f"Status Code: {session_resp.status_code}")
    if session_resp.status_code == 200:
        sess_data = session_resp.json()
        quiz_passed = sess_data.get("quiz_passed", {})
        print("Persisted quiz_passed field:")
        print(json.dumps(quiz_passed, indent=2))
    else:
        print("Session fetch failed!")
        print(session_resp.text)

if __name__ == "__main__":
    main()
