from fastapi import APIRouter
from app.config import get_settings
from app.schemas import HealthResponse
from app.services.ollama_service import OllamaService

router = APIRouter()
ollama = OllamaService()


@router.get("/health", response_model=HealthResponse)
async def health():
    settings = get_settings()
    return {
        "status": "ok",
        "service": "innova-ai-service",
        "ollama": await ollama.health(),
        "model": settings.ollama_model,
        "rag": settings.enable_rag,
    }
