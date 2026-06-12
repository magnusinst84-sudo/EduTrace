from firebase_admin import firestore
from agent.state import WorldState
import json

db = firestore.client()

def save_session(state: WorldState):
    db.collection("sessions").document(state.session_id).set(state.to_dict())

def load_session(session_id: str) -> dict | None:
    doc = db.collection("sessions").document(session_id).get()
    return doc.to_dict() if doc.exists else None

def get_user_sessions(uid: str) -> list:
    docs = db.collection("sessions").where("uid", "==", uid).stream()
    return [d.to_dict() for d in docs]

def delete_session(session_id: str):
    db.collection("sessions").document(session_id).delete()