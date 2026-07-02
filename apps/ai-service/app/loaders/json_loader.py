import json
from typing import Any


def flatten_json(value: dict[str, Any], title: str = "business-context") -> dict[str, str]:
    return {
        "title": title,
        "source": "backend-business-context",
        "content": json.dumps(value, ensure_ascii=False, indent=2, default=str),
    }
