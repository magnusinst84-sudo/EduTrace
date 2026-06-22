from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel

from middleware.rate_limit import limiter
from middleware.auth import verify_firebase_token
from middleware.sanitize import sanitize_topic
from agent.state import WorldState

# Lazy import helpers for route handlers to avoid premature db load
from agent.handlers import run_diagnostic_turn, generate_roadmap, run_adaptive_turn, generate_quiz, grade_quiz

router = APIRouter()

TECH_TOPICS = {
    "react", "javascript", "python", "typescript", "nodejs", "node.js",
    "system design", "docker", "sql", "git", "github", "data structures",
    "algorithms",
}

async def verify_session_ownership(
    request: Request,
    session_id: str,
    _=Depends(verify_firebase_token)
) -> dict:
    """
    Verifies the authenticated user (request.state.uid) owns the given session.
    Returns the loaded session dict if valid, so route handlers can reuse it
    instead of loading it twice. Raises 404 if session doesn't exist, 403 if
    it belongs to a different user.
    """
    from db.sessions import load_session
    loaded = load_session(session_id)
    if loaded is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if loaded.get("uid") != request.state.uid:
        raise HTTPException(status_code=403, detail="Access denied")
    return loaded

class SessionRequest(BaseModel):
    topic: str


class DiagnosticRequest(BaseModel):
    answer: str


class ChatRequest(BaseModel):
    message: str


class QuizSubmitRequest(BaseModel):
    answers: dict


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
    _session=Depends(verify_session_ownership)
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
    _session=Depends(verify_session_ownership)
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
    _session=Depends(verify_session_ownership)
):
    try:
        res = await run_adaptive_turn(session_id, body.message)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/session/{session_id}/quiz")
@limiter.limit("5/minute")
async def quiz_route(
    request: Request,
    session_id: str,
    _session=Depends(verify_session_ownership)
):
    try:
        res = await generate_quiz(session_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/session/{session_id}/quiz/submit")
@limiter.limit("5/minute")
async def quiz_submit_route(
    request: Request,
    session_id: str,
    body: QuizSubmitRequest,
    _session=Depends(verify_session_ownership)
):
    try:
        res = await grade_quiz(session_id, body.answers)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/session/{session_id}")
@limiter.limit("30/minute")
async def get_session(
    request: Request,
    session_id: str,
    _session=Depends(verify_session_ownership)
):
    # The dependency already loaded and verified the session!
    return _session


@router.get("/sessions")
@limiter.limit("30/minute")
async def get_sessions(
    request: Request,
    _=Depends(verify_firebase_token)
):
    from db.sessions import get_user_sessions
    result = get_user_sessions(request.state.uid)
    return {"sessions": result}


@router.delete("/session/{session_id}")
@limiter.limit("10/minute")
async def delete_session_route(
    request: Request,
    session_id: str,
    _session=Depends(verify_session_ownership)
):
    from db.sessions import delete_session
    delete_session(session_id)
    return {"status": "deleted", "session_id": session_id}
