from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from middleware.rate_limit import limiter
from middleware.auth import verify_firebase_token
from middleware.sanitize import sanitize_topic
from agent.state import WorldState

router = APIRouter()

TECH_TOPICS = {
    "react", "javascript", "python", "typescript", "nodejs", "node.js",
    "system design", "docker", "sql", "git", "github", "data structures",
    "algorithms",
}


class SessionRequest(BaseModel):
    topic: str


@router.post("/session/start")
@limiter.limit("5/minute")
async def start_session(request: Request, body: SessionRequest, _=Depends(verify_firebase_token)):
    topic = sanitize_topic(body.topic)

    domain = "tech" if topic.lower() in TECH_TOPICS else "non-tech"
    topic_slug = topic.lower().replace(" ", "-")

    state = WorldState(
        uid=request.state.uid,
        topic=topic,
        topic_slug=topic_slug,
        domain=domain,
    )

    # Lazy import — db.sessions creates the Firestore client at module level,
    # so it must be imported after Firebase has been initialised in main.py.
    from db.sessions import save_session
    save_session(state)

    return {"session_id": state.session_id, "state": state.to_dict()}
