import re
import bleach
from fastapi import HTTPException

# Prompt-injection patterns (case-insensitive)
_INJECTION_PATTERNS = [
    re.compile(r"ignore (all |previous |prior )?(instructions|prompts|context)", re.IGNORECASE),
    re.compile(r"you are now", re.IGNORECASE),
    re.compile(r"forget (your |all )?(instructions|context|rules)", re.IGNORECASE),
    re.compile(r"(new|updated|override) (system |)prompt", re.IGNORECASE),
    re.compile(r"act as (a |an |)(different|new|other)", re.IGNORECASE),
    re.compile(r"jailbreak", re.IGNORECASE),
    re.compile(r"disregard (your |all |previous )", re.IGNORECASE),
    re.compile(r"pretend (you are|to be)", re.IGNORECASE),
    re.compile(r"roleplay as", re.IGNORECASE),
]

_TOPIC_ALLOWED = re.compile(r"^[a-zA-Z0-9 .\-/#+]+$")


def sanitize_message(text: str) -> str:
    """Validate and sanitize a user chat message."""
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(text) > 2000:
        raise HTTPException(status_code=400, detail="Message exceeds 2000 character limit")

    # Strip all HTML
    text = bleach.clean(text, tags=[], strip=True)

    # Check for prompt injection
    for pattern in _INJECTION_PATTERNS:
        if pattern.search(text):
            raise HTTPException(status_code=400, detail="Invalid input detected")

    return text.strip()


def sanitize_topic(topic: str) -> str:
    """Validate and sanitize a session topic string."""
    if not topic or not topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    if len(topic) > 100:
        raise HTTPException(status_code=400, detail="Topic exceeds 100 character limit")

    # Strip HTML
    topic = bleach.clean(topic, tags=[], strip=True)

    # Whitelist allowed characters
    if not _TOPIC_ALLOWED.match(topic):
        raise HTTPException(status_code=400, detail="Topic contains invalid characters")

    return topic.strip()
