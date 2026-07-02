from pathlib import Path
from fastapi import APIRouter
from app.schemas import AddDocumentRequest, RebuildIndexRequest
from app.services.rag_service import RagService

router = APIRouter(prefix="/index")
rag_service = RagService()


def project_root() -> Path:
    return Path(__file__).resolve().parents[4]


@router.post("/rebuild")
async def rebuild_index(request: RebuildIndexRequest):
    return rag_service.rebuild_index(
        project_root=project_root(),
        business_context=request.business_context,
        include_docs=request.include_docs,
    )


@router.post("/add-document")
async def add_document(request: AddDocumentRequest):
    return rag_service.add_document(request.title, request.content, request.source)


@router.get("/status")
async def index_status():
    return rag_service.status()
