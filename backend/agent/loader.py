"""Load scraped roadmap data and build prompt context strings."""

import json
from pathlib import Path

ROADMAP_DIR = Path(__file__).parent.parent / "data" / "roadmaps"


def load_roadmap(topic_slug: str) -> dict | None:
    """Load and return a scraped roadmap JSON, or None if not found."""
    path = ROADMAP_DIR / f"{topic_slug}.json"
    if not path.exists():
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_topic_slug(topic: str) -> str:
    """Convert a topic name to its slug, verifying it exists on disk."""
    slug = topic.lower().replace(" ", "-")
    if (ROADMAP_DIR / f"{slug}.json").exists():
        return slug
    return topic.lower()


def build_prompt_context(topic_slug: str, level: str) -> str:
    """Build a grounding context string from roadmap nodes for an LLM prompt."""
    roadmap = load_roadmap(topic_slug)
    if roadmap is None:
        return ""

    nodes = roadmap.get("nodes", [])[:40]

    lines: list[str] = []
    for node in nodes:
        label = node.get("label", "")
        desc = node.get("description", "")[:200]
        resources = node.get("resources", [])

        # Include title AND url — previously only titles were extracted,
        # causing Gemini to hallucinate URLs instead of using real ones.
        resource_lines = "\n".join(
            f"    - {r.get('title', '')} → {r.get('url', '')}"
            for r in resources[:3]
            if r.get("url")
        )

        lines.append(
            f"Topic: {label}\n"
            f"Description: {desc}\n"
            f"Resources:\n{resource_lines if resource_lines else '    (none)'}\n"
        )

    content = "\n".join(lines)
    return f"=== ROADMAP CONTEXT (from roadmap.sh) ===\n{content}"