from fastapi import APIRouter
from app.config import get_settings
from app.services.ollama_service import OllamaService

router = APIRouter()
ollama = OllamaService()


@router.get("/models")
async def models():
    settings = get_settings()
    return {
        "current": settings.ollama_model,
        "fallback": settings.ollama_fallback_model,
        "embedding": settings.ollama_embedding_model,
        "available": await ollama.models(),
    }
