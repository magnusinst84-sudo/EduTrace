from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
from utils.firebase_init import init_firebase
from middleware.rate_limit import limiter
from routes.session import router as session_router

load_dotenv()
init_firebase()

app = FastAPI()

# --- Rate limiting ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# --- Routes ---
app.include_router(session_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}