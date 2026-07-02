from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.chat_router import router as chat_router
from app.routers.health_router import router as health_router
from app.routers.index_router import router as index_router
from app.routers.models_router import router as models_router

app = FastAPI(
    title="Innova AI Service",
    description="Microservicio local de IA con Ollama, LlamaIndex/ChromaDB y RAG seguro.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(models_router)
app.include_router(chat_router)
app.include_router(index_router)
