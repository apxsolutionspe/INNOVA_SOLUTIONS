from pathlib import Path
from app.utils.text_cleaner import clean_text, is_safe_path


ALLOWED_EXTENSIONS = {".md", ".txt", ".json"}


def load_project_documents(root: Path) -> list[dict[str, str]]:
    documents: list[dict[str, str]] = []
    candidates = [root / "README.md", root / "docs"]

    for candidate in candidates:
        if candidate.is_file():
            documents.extend(_read_file(candidate))
        elif candidate.is_dir():
            for path in candidate.rglob("*"):
                if path.is_file():
                    documents.extend(_read_file(path))

    return documents


def _read_file(path: Path) -> list[dict[str, str]]:
    if path.suffix.lower() not in ALLOWED_EXTENSIONS or not is_safe_path(path):
        return []
    try:
        content = clean_text(path.read_text(encoding="utf-8", errors="ignore"), 8000)
    except OSError:
        return []
    if len(content) < 20:
        return []
    return [{"title": path.name, "source": str(path), "content": content}]
