# EduTrace — AI-Powered Adaptive Learning Path Agent

> Type a topic. Get a personalized roadmap. Learn with an agent that adapts to you.

EduTrace is a full-stack AI learning agent built for the **Build with Gemini Hackathon**. It conducts a short diagnostic conversation to assess your current knowledge, generates a week-by-week structured roadmap grounded in real [roadmap.sh](https://roadmap.sh) data via RAG, and then tutors you through it — detecting confusion, switching teaching styles, and quizzing you at the end of each week.

**Live demo:** [edu-trace-ten.vercel.app](https://edu-trace-ten.vercel.app)

---

## What it does

Most learning roadmaps are static. EduTrace isn't. It starts by asking you 3 targeted diagnostic questions to understand what you already know, then builds a roadmap that starts *where you are* — not at week 1 for everyone. As you learn, it tracks your world state turn-by-turn: what concepts you've understood, where you're stuck, and how you like to learn.

When you're confused, it doesn't just repeat itself. It switches modes — re-explaining from a different angle, breaking things into micro-steps, or pointing you to a specific resource. You control the teaching style (Analogy, Socratic, Code Examples) and the pace (Relaxed, Normal, Accelerated) from the sidebar.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS, JetBrains Mono |
| Auth | Firebase Auth (Google OAuth + Email/Password) |
| Database | Firestore (session + conversation persistence) |
| AI | Gemini 2.0 Flash (primary), 1.5 Flash (fallback) |
| Backend | FastAPI (Python), async, token-verified |
| Rate Limiting | slowapi (per-user) |
| Roadmap Data | roadmap.sh scraped JSON (60+ topics, static files) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Gemini API — 4 Distinct Uses

This is what makes EduTrace more than a wrapper around a chat API:

1. **Level Inference** — Reads 3 diagnostic answers, classifies beginner / intermediate / advanced, returns structured JSON
2. **RAG Roadmap Generation** — Reads roadmap.sh content as grounding context, sequences it into a week-by-week curriculum tailored to the inferred level
3. **Stateful Adaptive Conversation** — Full world state + last 20 turns injected every turn; Gemini returns a state delta alongside the response
4. **Stuck Mode Reasoning** — On confusion signals, selects the right intervention mode and generates the appropriate response

Uses 2 and 3 in combination are the core differentiator — Gemini functions as a stateful reasoning engine grounded in real external data, not just a chat model.

---

## Project Structure

```
edutrace/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, middleware registration
│   ├── requirements.txt
│   ├── agent/
│   │   ├── state.py             # WorldState dataclass — full session state
│   │   ├── handlers.py          # Diagnostic, roadmap, adaptive, stuck logic
│   │   ├── prompts.py           # All Gemini prompt templates
│   │   ├── gemini.py            # Two SDK instances (roadmap + chat) — do not consolidate
│   │   └── loader.py            # roadmap.sh JSON loader for RAG context
│   ├── db/
│   │   └── sessions.py          # Firestore read/write, session hydration
│   ├── middleware/
│   │   ├── auth.py              # Firebase token verification on every protected route
│   │   ├── rate_limit.py        # slowapi — 20/min chat, 5/min session start
│   │   ├── sanitize.py          # bleach + prompt injection detection
│   │   └── security_headers.py  # X-Frame-Options, nosniff, HSTS
│   ├── routes/
│   │   └── session.py           # /api/session/start, /api/session/{id}
│   ├── data/roadmaps/           # 60+ roadmap.sh topic JSONs (RAG source)
│   └── scripts/
│       └── scrape_roadmaps.py   # One-time scraper used to build data/roadmaps/
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Hero.jsx          # Landing — dot-grid bg, CTAs
        │   ├── Login.jsx         # Firebase auth form
        │   ├── Landing.jsx       # Dashboard — topic input, session cards, stats
        │   ├── Chat.jsx          # Main app — 3-column layout
        │   └── Progress.jsx      # Week-by-week progress view
        ├── components/
        │   ├── WorldStatePanel.jsx     # Topic, level, progress, teaching mode, pace
        │   ├── RoadmapWeekCard.jsx     # Accordion week cards, YouTube embed detection
        │   ├── MessageBubble.jsx       # Agent/user bubbles, mode-switch styling
        │   ├── QuizPanel.jsx           # MCQ + short answer + code challenge
        │   └── StuckModeBanner.jsx     # Stuck mode indicator
        ├── api/client.js          # Axios client — attaches Firebase token to every request
        └── utils/exportRoadmapPDF.js  # jsPDF roadmap export
```

---

## Architecture

```
Browser (React)
    │
    ├── Firebase Auth SDK  →  ID token attached to every request
    │
    └── FastAPI Backend
            ├── Token verify (every request)
            ├── Rate limiter (slowapi)
            ├── Input sanitizer (bleach)
            │
            ├── Gemini API  ←  4 distinct call patterns
            ├── Firestore   ←  session + conversation history
            └── roadmap.sh JSON  ←  RAG grounding context
```

### Conversation State Machine

```
IDLE
  → [topic submitted] → DIAGNOSTIC (turns 1-3)
  → [diagnostic complete] → ROADMAP_GENERATING
  → [roadmap ready] → ADAPTIVE_LEARNING
  → [stuck detected] → STUCK_MODE → [resolved] → ADAPTIVE_LEARNING
  → [quiz triggered] → QUIZ_MODE → [complete] → ADAPTIVE_LEARNING
  → [start over] → IDLE
```

### Important: Two Gemini SDK Instances

`backend/agent/gemini.py` intentionally maintains two separate SDK instances:

- **Roadmap generation** — calls `gemini_call` directly, no search grounding, optimized for speed
- **Chat** — uses the full SDK with conversation history injection and state delta return

Do not consolidate these. The tradeoff between performance (roadmap) and statefulness (chat) is intentional.

---

## API Endpoints

| Endpoint | Auth | Description |
|---|---|---|
| `POST /api/session/start` | Required | Creates session, returns session_id + initial world state |
| `POST /api/chat` | Required | Main chat endpoint. Body: `{session_id, message}` |
| `GET /api/session/{id}` | Required | Returns current world state |
| `GET /api/roadmaps` | Public | Lists available roadmap.sh topic slugs |
| `GET /health` | Public | Health check for Render cold-start monitoring |

---

## Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- A Firebase project with Firestore + Auth enabled
- A Gemini API key

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create backend/.env (see .env.example at repo root)
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Create frontend/.env (see frontend/.env.example)
npm run dev
```

### Environment Variables

**Backend (`backend/.env`)**
```
GEMINI_API_KEY=
FIREBASE_SERVICE_ACCOUNT_JSON=   # full JSON string or path
ENVIRONMENT=development
```

**Frontend (`frontend/.env`)**
```
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Neither `.env` file is committed. See `.gitignore` and `.env.example`.

---

## Features

| Feature | Status |
|---|---|
| 3-turn adaptive diagnostic | Shipped |
| RAG-grounded roadmap generation (60+ topics) | Shipped |
| Stateful multi-turn adaptive conversation | Shipped |
| Stuck detection + 3 response modes | Shipped |
| Teaching modes: Analogy / Socratic / Code | Shipped |
| Learning pace: Relaxed / Normal / Accelerated | Shipped |
| End-of-week quizzes (MCQ + short answer + code) | Shipped |
| PDF roadmap export (jsPDF) | Shipped |
| YouTube resource embeds | Shipped |
| Progress page with week status cards | Shipped |
| Firebase Auth (Google OAuth + Email/Password) | Shipped |
| Session persistence + resume | Shipped |
| Cyberpunk dark UI (JetBrains Mono, cyan/magenta) | Shipped |
| Gamification / streaks | Skipped |
| Monaco in-browser code editor | Skipped |
| Flashcards / spaced repetition | Skipped |

---

## Security

- Gemini API key is backend-only — never exposed to the frontend
- Firebase ID token verified on every protected endpoint; backend never trusts client-sent UIDs
- CORS locked to Vercel origin in production (no wildcard)
- Rate limiting: 20 req/min on `/api/chat`, 5 req/min on `/api/session/start`
- Input sanitized with `bleach` + prompt injection detection before reaching Gemini
- Firestore security rules: users can only read/write their own sessions
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `HSTS`
- No stack traces returned to client (global exception handler)
- `pip audit` and `npm audit` clean — no high/critical CVEs

---

## Cost Controls

- `max_output_tokens=1500` on all Gemini calls
- Only the last 20 conversation turns are sent per request
- roadmap.sh RAG context truncated to 1800 tokens
- Gemini 1.5 Flash fallback on 429 responses
- Firestore writes batched every 3 turns, not every turn

---

## Deployment

| Layer | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://edu-trace-ten.vercel.app |
| Backend | Render | https://edutrace-backend.onrender.com |
| Auth + DB | Firebase | — |

Note: the Render backend runs on the free tier. First request after inactivity may take ~30 seconds (cold start). The frontend handles this with a spinner and 5-second retry.

---

## Hackathon Context

Built for the **Build with Gemini Hackathon** over 15 days (Jun 11 – Jun 26, 2025).

The original PRD specified a light theme and a narrower feature set. During build the scope expanded significantly — teaching modes, learning pace, quizzes, PDF export, a progress page, and a full cyberpunk UI overhaul were all added beyond the original plan.

---

*EduTrace — Learn anything. Smarter.*