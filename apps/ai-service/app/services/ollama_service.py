import httpx
from app.config import get_settings
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)


class OllamaService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def health(self) -> str:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.settings.ollama_base_url}/api/tags")
                response.raise_for_status()
            return "connected"
        except Exception as exc:
            logger.warning("Ollama health failed: %s", exc)
            return "disconnected"

    async def models(self) -> list[str]:
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                response = await client.get(f"{self.settings.ollama_base_url}/api/tags")
                response.raise_for_status()
                payload = response.json()
            return [item.get("name", "") for item in payload.get("models", []) if item.get("name")]
        except Exception as exc:
            logger.warning("Ollama models failed: %s", exc)
            return []

    async def generate(self, question: str, context: str) -> tuple[str, str, str]:
        models = [self.settings.ollama_model, self.settings.ollama_fallback_model]
        prompt = self._build_prompt(question, context)

        for model in models:
            try:
                async with httpx.AsyncClient(timeout=90) as client:
                    response = await client.post(
                        f"{self.settings.ollama_base_url}/api/generate",
                        json={"model": model, "prompt": prompt, "stream": False},
                    )
                    response.raise_for_status()
                    payload = response.json()
                    return payload.get("response", "").strip(), model, "local-rag"
            except Exception as exc:
                logger.warning("Ollama generation failed for %s: %s", model, exc)

        return self._fallback_answer(question, context), self.settings.ollama_model, "local-fallback"

    def _build_prompt(self, question: str, context: str) -> str:
        return f"""{SYSTEM_PROMPT}

Contexto disponible:
{context or "Sin contexto RAG disponible."}

Pregunta del usuario:
{question}

Responde en espanol con:
1. Respuesta principal.
2. Insights clave.
3. Recomendaciones accionables.
"""

    def _fallback_answer(self, question: str, context: str) -> str:
        if not context:
            return "IA local no disponible. Verifica que Ollama este ejecutandose y que el modelo local este instalado."
        return (
            "Ollama no esta disponible en este momento. Con el contexto interno recibido, "
            f"la consulta '{question}' debe revisarse priorizando alertas de stock, caja, compras y rentabilidad."
        )
