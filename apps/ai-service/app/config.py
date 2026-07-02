from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ai_service_port: int = Field(default=8001, alias="AI_SERVICE_PORT")
    ollama_base_url: str = Field(default="http://localhost:11434", alias="OLLAMA_BASE_URL")
    ollama_model: str = Field(default="qwen3", alias="OLLAMA_MODEL")
    ollama_fallback_model: str = Field(default="llama3.2", alias="OLLAMA_FALLBACK_MODEL")
    ollama_embedding_model: str = Field(default="nomic-embed-text", alias="OLLAMA_EMBEDDING_MODEL")
    chroma_persist_dir: str = Field(default="./storage/chroma", alias="CHROMA_PERSIST_DIR")
    rag_top_k: int = Field(default=5, alias="RAG_TOP_K")
    rag_max_context_chars: int = Field(default=12000, alias="RAG_MAX_CONTEXT_CHARS")
    ai_mode: str = Field(default="local", alias="AI_MODE")
    enable_rag: bool = Field(default=True, alias="ENABLE_RAG")
    enable_business_analysis: bool = Field(default=True, alias="ENABLE_BUSINESS_ANALYSIS")
    log_level: str = Field(default="info", alias="LOG_LEVEL")

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
