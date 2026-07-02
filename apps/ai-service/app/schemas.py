from typing import Any
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    context: dict[str, Any] = Field(default_factory=dict)
    use_rag: bool = True
    mode: str = "business"


class Source(BaseModel):
    title: str
    path: str | None = None
    score: float | None = None
    excerpt: str | None = None


class ChatResponse(BaseModel):
    success: bool
    answer: str
    insights: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    sources: list[Source] = Field(default_factory=list)
    model: str
    mode: str


class AddDocumentRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    content: str = Field(min_length=10)
    source: str | None = None


class RebuildIndexRequest(BaseModel):
    business_context: dict[str, Any] = Field(default_factory=dict)
    include_docs: bool = True


class HealthResponse(BaseModel):
    status: str
    service: str
    ollama: str
    model: str
    rag: bool
