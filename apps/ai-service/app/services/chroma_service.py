from pathlib import Path
from typing import Any

from app.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ChromaService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.documents: list[dict[str, str]] = []
        self._chroma_collection: Any | None = None
        self._init_chroma()

    def _init_chroma(self) -> None:
        try:
            import chromadb

            Path(self.settings.chroma_persist_dir).mkdir(parents=True, exist_ok=True)
            client = chromadb.PersistentClient(path=self.settings.chroma_persist_dir)
            self._chroma_collection = client.get_or_create_collection("innova_knowledge")
        except Exception as exc:
            logger.warning("ChromaDB unavailable, using memory index: %s", exc)
            self._chroma_collection = None

    def rebuild(self, documents: list[dict[str, str]]) -> dict[str, Any]:
        self.documents = documents
        if self._chroma_collection:
            try:
                existing = self._chroma_collection.get()
                if existing.get("ids"):
                    self._chroma_collection.delete(ids=existing["ids"])
                self._chroma_collection.add(
                    ids=[f"doc-{index}" for index, _ in enumerate(documents)],
                    documents=[doc["content"] for doc in documents],
                    metadatas=[{"title": doc["title"], "source": doc.get("source", "")} for doc in documents],
                )
            except Exception as exc:
                logger.warning("Chroma rebuild failed, keeping memory index: %s", exc)
        return self.status()

    def add_document(self, document: dict[str, str]) -> dict[str, Any]:
        self.documents.append(document)
        if self._chroma_collection:
            try:
                doc_id = f"doc-{len(self.documents) - 1}"
                self._chroma_collection.add(
                    ids=[doc_id],
                    documents=[document["content"]],
                    metadatas=[{"title": document["title"], "source": document.get("source", "")}],
                )
            except Exception as exc:
                logger.warning("Chroma add failed: %s", exc)
        return self.status()

    def search(self, query: str, limit: int) -> list[dict[str, Any]]:
        if self._chroma_collection:
            try:
                result = self._chroma_collection.query(query_texts=[query], n_results=limit)
                docs = result.get("documents", [[]])[0]
                metas = result.get("metadatas", [[]])[0]
                distances = result.get("distances", [[]])[0]
                return [
                    {
                        "title": meta.get("title", "Documento"),
                        "path": meta.get("source"),
                        "score": float(distances[index]) if index < len(distances) else None,
                        "excerpt": doc[:500],
                        "content": doc,
                    }
                    for index, (doc, meta) in enumerate(zip(docs, metas))
                ]
            except Exception as exc:
                logger.warning("Chroma search failed, using memory search: %s", exc)

        terms = set(query.lower().split())
        scored = []
        for doc in self.documents:
            content = doc["content"].lower()
            score = sum(1 for term in terms if term in content)
            if score:
                scored.append((score, doc))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [
            {
                "title": doc["title"],
                "path": doc.get("source"),
                "score": float(score),
                "excerpt": doc["content"][:500],
                "content": doc["content"],
            }
            for score, doc in scored[:limit]
        ]

    def status(self) -> dict[str, Any]:
        return {
            "documents": len(self.documents),
            "chroma": "connected" if self._chroma_collection else "memory-fallback",
            "persistDir": self.settings.chroma_persist_dir,
        }
