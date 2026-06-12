from firebase_admin import auth
from fastapi import Request, HTTPException

async def verify_firebase_token(request: Request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid auth header")

    token = auth_header.split("Bearer ")[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Empty token")

    try:
        decoded = auth.verify_id_token(token)
        request.state.uid = decoded["uid"]
        request.state.email = decoded.get("email", "")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")