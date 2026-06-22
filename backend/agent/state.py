from dataclasses import dataclass, field, asdict
import uuid

@dataclass
class WorldState:
    uid: str
    topic: str
    session_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    topic_slug: str = ""
    domain: str = "tech"
    level: str | None = None
    diagnostic_complete: bool = False
    diagnostic_turn: int = 0
    diagnostic_answers: list = field(default_factory=list)
    roadmap_generated: bool = False
    roadmap: dict = field(default_factory=dict)
    current_week: int = 0
    total_weeks: int = 0
    current_quiz: dict = field(default_factory=dict)
    quiz_passed: dict = field(default_factory=dict)
    concepts_understood: list = field(default_factory=list)
    concepts_stuck: list = field(default_factory=list)
    stuck_mode_active: bool = False
    teaching_mode: str = "analogy"
    conversation_history: list = field(default_factory=list)

    def to_dict(self):
        return asdict(self)

        