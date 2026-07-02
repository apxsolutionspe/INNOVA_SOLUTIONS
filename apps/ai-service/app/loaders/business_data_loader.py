from typing import Any
from app.loaders.json_loader import flatten_json


def load_business_context(context: dict[str, Any]) -> list[dict[str, str]]:
    if not context:
        return []
    return [flatten_json(context)]
