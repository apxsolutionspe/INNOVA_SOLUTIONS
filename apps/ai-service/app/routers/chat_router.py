from fastapi import APIRouter
from app.schemas import ChatRequest, ChatResponse
from app.services.rag_service import RagService

router = APIRouter()
rag_service = RagService()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    return await rag_service.chat(
        question=request.question,
        context=request.context,
        use_rag=request.use_rag,
        mode=request.mode,
    )
