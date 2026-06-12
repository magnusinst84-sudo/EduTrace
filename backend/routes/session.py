from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel

from middleware.rate_limit import limiter
from middleware.auth import verify_firebase_token
from middleware.sanitize import sanitize_topic
from agent.state import WorldState

# Lazy import helpers for route handlers to avoid premature db load
from agent.handlers import run_diagnostic_turn, generate_roadmap, run_adaptive_turn

router = APIRouter()

TECH_TOPICS = {
    "react", "javascript", "python", "typescript", "nodejs", "node.js",
    "system design", "docker", "sql", "git", "github", "data structures",
    "algorithms",
}


class SessionRequest(BaseModel):
    topic: str


class DiagnosticRequest(BaseModel):
    answer: str


class ChatRequest(BaseModel):
    message: str


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


@router.post("/session/{session_id}/diagnostic")
@limiter.limit("20/minute")
async def diagnostic_route(
    request: Request,
    session_id: str,
    body: DiagnosticRequest,
    _=Depends(verify_firebase_token)
):
    try:
        res = await run_diagnostic_turn(session_id, body.answer)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/session/{session_id}/roadmap")
@limiter.limit("5/minute")
async def roadmap_route(
    request: Request,
    session_id: str,
    _=Depends(verify_firebase_token)
):
    try:
        res = await generate_roadmap(session_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/session/{session_id}/chat")
@limiter.limit("20/minute")
async def chat_route(
    request: Request,
    session_id: str,
    body: ChatRequest,
    _=Depends(verify_firebase_token)
):
    try:
        res = await run_adaptive_turn(session_id, body.message)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
