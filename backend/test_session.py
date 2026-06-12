# backend/test_session.py
from dotenv import load_dotenv
load_dotenv()

from utils.firebase_init import init_firebase
init_firebase()

from agent.state import WorldState
from db.sessions import save_session, load_session

state = WorldState(uid="test-user-123", topic="React")
save_session(state)

loaded = load_session(state.session_id)
print("Session saved and loaded:", loaded["topic"], loaded["session_id"])   