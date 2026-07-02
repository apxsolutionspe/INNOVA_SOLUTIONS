from pathlib import Path

SENSITIVE_PATTERNS = [
    "JWT_SECRET",
    "DATABASE_URL",
    "PASSWORD",
    "TOKEN",
    "PRIVATE_KEY",
    "ACCESS_TOKEN",
    "CLIENT_SECRET",
]


def is_safe_path(path: Path) -> bool:
    blocked_parts = {".env", "node_modules", "dist", "build", ".git", ".venv", "__pycache__"}
    return not any(part in blocked_parts for part in path.parts)


def clean_text(value: str, max_chars: int | None = None) -> str:
    text = value.replace("\x00", " ").strip()
    for pattern in SENSITIVE_PATTERNS:
        text = text.replace(pattern, "[REDACTED]")
    while "\n\n\n" in text:
        text = text.replace("\n\n\n", "\n\n")
    return text[:max_chars] if max_chars else text
