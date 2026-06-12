"""
Scrape local roadmap.sh data into structured JSON files.

Source: roadmaps folder (local download from roadmap.sh)
Output: backend/data/roadmaps/{slug}.json + index.json
"""

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────
SOURCE_DIR = Path(r"C:\Users\TANMAY\Downloads\roadmaps")
SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = SCRIPT_DIR.parent / "data" / "roadmaps"


def parse_markdown(md_text: str) -> tuple[str, list[dict]]:
    """Return (description, resources) from a roadmap content .md file."""
    lines = md_text.splitlines()

    desc_lines: list[str] = []
    resources: list[dict] = []
    in_description = True

    for line in lines:
        # Skip H1 title
        if line.startswith("# "):
            continue

        # Stop description at the "Visit the following resources" line
        if "Visit the following resources" in line:
            in_description = False
            continue

        if in_description:
            desc_lines.append(line)
        else:
            # Parse resource lines like: - [@type@Title](url)
            m = re.match(r"^-\s+\[@(\w+)@([^\]]+)\]\(([^)]+)\)", line)
            if m:
                resources.append({
                    "type": m.group(1),
                    "title": m.group(2).strip(),
                    "url": m.group(3).strip(),
                })

    description = "\n".join(desc_lines).strip()
    return description, resources


def scrape_topic(slug: str) -> dict | None:
    """Scrape a single roadmap topic folder and return the output dict."""
    topic_dir = SOURCE_DIR / slug
    json_path = topic_dir / f"{slug}.json"

    if not json_path.exists():
        return None

    # ── 1. Parse the graph JSON ────────────────────────────────────────
    with open(json_path, "r", encoding="utf-8") as f:
        graph = json.load(f)

    # Build a map of node-id → label for topic/subtopic nodes
    node_map: dict[str, str] = {}
    for node in graph.get("nodes", []):
        ntype = node.get("type", "")
        if ntype in ("topic", "subtopic"):
            nid = node["id"]
            label = node.get("data", {}).get("label", "")
            if label:
                node_map[nid] = label

    # ── 2. Match content .md files to nodes ────────────────────────────
    content_dir = topic_dir / "content"
    content_map: dict[str, tuple[str, list[dict]]] = {}  # node_id → (desc, resources)

    if content_dir.is_dir():
        for md_file in content_dir.glob("*.md"):
            # Filename pattern: {anything}@{node-id}.md
            stem = md_file.stem  # e.g. "components@79K4xgljcoSHkCYI1D55O"
            at_idx = stem.rfind("@")
            if at_idx == -1:
                continue
            node_id = stem[at_idx + 1:]
            with open(md_file, "r", encoding="utf-8") as f:
                md_text = f.read()
            desc, resources = parse_markdown(md_text)
            content_map[node_id] = (desc, resources)

    # ── 3. Build the output nodes list ─────────────────────────────────
    nodes: list[dict] = []
    with_content = 0

    for nid, label in node_map.items():
        desc, resources = content_map.get(nid, ("", []))
        if desc or resources:
            with_content += 1
        nodes.append({
            "id": nid,
            "label": label,
            "description": desc,
            "resources": resources,
        })

    # ── 4. Save ────────────────────────────────────────────────────────
    result = {
        "topic": slug,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "nodes": nodes,
    }

    out_path = OUTPUT_DIR / f"{slug}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Scraped {slug}: {len(nodes)} nodes, {with_content} with content")
    return result


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    slugs: list[str] = []

    for entry in sorted(SOURCE_DIR.iterdir()):
        if entry.is_dir():
            result = scrape_topic(entry.name)
            if result:
                slugs.append(entry.name)

    # ── Save index ─────────────────────────────────────────────────────
    index = {
        "topics": slugs,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }
    with open(OUTPUT_DIR / "index.json", "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"\nDone -- {len(slugs)} topics scraped -> {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
