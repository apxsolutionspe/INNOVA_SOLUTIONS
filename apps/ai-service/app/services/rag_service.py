from pathlib import Path
from typing import Any

from app.config import get_settings
from app.loaders.business_data_loader import load_business_context
from app.loaders.docs_loader import load_project_documents
from app.schemas import Source
from app.services.business_context_service import BusinessContextService
from app.services.chroma_service import ChromaService
from app.services.ollama_service import OllamaService
from app.utils.response_formatter import fallback_recommendations


class RagService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.chroma = ChromaService()
        self.ollama = OllamaService()
        self.business_context = BusinessContextService()

    async def chat(self, question: str, context: dict[str, Any], use_rag: bool, mode: str) -> dict[str, Any]:
        business_summary = self.business_context.summarize(context)
        sources: list[dict[str, Any]] = []
        retrieved_context = ""

        if use_rag and self.settings.enable_rag:
            sources = self.chroma.search(question, self.settings.rag_top_k)
            retrieved_context = "\n\n".join(source["content"] for source in sources)[: self.settings.rag_max_context_chars]

        final_context = "\n\n".join(part for part in [business_summary, retrieved_context] if part)
        answer, model, response_mode = await self.ollama.generate(question, final_context)
        insights = self._build_insights(context, sources)
        recommendations = fallback_recommendations(question, insights)

        return {
            "success": True,
            "answer": answer,
            "insights": insights,
            "recommendations": recommendations,
            "sources": [Source(**source).model_dump() for source in sources],
            "model": model,
            "mode": response_mode if use_rag else mode,
        }

    def rebuild_index(self, project_root: Path, business_context: dict[str, Any], include_docs: bool) -> dict[str, Any]:
        documents = []
        if include_docs:
            documents.extend(load_project_documents(project_root))
        documents.extend(load_business_context(business_context))
        return self.chroma.rebuild(documents)

    def add_document(self, title: str, content: str, source: str | None) -> dict[str, Any]:
        return self.chroma.add_document({"title": title, "content": content, "source": source or "manual"})

    def status(self) -> dict[str, Any]:
        return self.chroma.status()

    def _build_insights(self, context: dict[str, Any], sources: list[dict[str, Any]]) -> list[str]:
        insights: list[str] = []
        inventory = context.get("inventory", {})
        sales = context.get("sales", {})
        cash = context.get("cash", {})
        profitability = context.get("profitability", {})

        if inventory.get("lowStock"):
            insights.append(f"Inventario: {len(inventory['lowStock'])} productos requieren reposicion.")
        if inventory.get("outOfStock"):
            insights.append(f"Inventario: {len(inventory['outOfStock'])} productos estan sin stock.")
        if sales.get("incomeToday") is not None:
            insights.append(f"Ventas: ingresos del dia S/ {float(sales.get('incomeToday', 0)):.2f}.")
        if cash.get("currentCashStatus"):
            insights.append(f"Caja: estado actual {cash.get('currentCashStatus')}.")
        if profitability.get("estimatedNetProfit") is not None:
            insights.append(f"Rentabilidad: utilidad estimada S/ {float(profitability.get('estimatedNetProfit', 0)):.2f}.")
        if sources:
            insights.append(f"RAG: se recuperaron {len(sources)} fuentes relevantes.")
        return insights
