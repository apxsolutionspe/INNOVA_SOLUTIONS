from typing import Any
from app.services.safety_service import SafetyService


class BusinessContextService:
    def __init__(self) -> None:
        self.safety = SafetyService()

    def summarize(self, context: dict[str, Any]) -> str:
        sanitized = self.safety.sanitize_context(context)
        sections: list[str] = []
        for key, value in sanitized.items():
            sections.append(f"{key}: {value}")
        return "\n".join(sections)[:12000]
