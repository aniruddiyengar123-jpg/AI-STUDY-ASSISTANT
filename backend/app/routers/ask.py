from fastapi import APIRouter, Depends, status
from app.models.schemas import AskRequest, AskResponse, ErrorResponse
from app.services.nvidia_service import NvidiaService, get_nvidia_service

router = APIRouter(prefix="/api", tags=["Study Assistant"])


@router.post(
    "/ask",
    response_model=AskResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask a study question",
    description="Submits a student's question and retrieves an educational answer generated via NVIDIA API.",
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input question"},
        429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
        502: {"model": ErrorResponse, "description": "Upstream AI service error"},
        503: {"model": ErrorResponse, "description": "AI service not configured"},
        504: {"model": ErrorResponse, "description": "Gateway timeout"},
    }
)
async def ask_question(
    payload: AskRequest,
    nvidia_service: NvidiaService = Depends(get_nvidia_service)
) -> AskResponse:
    """Processes study questions and returns AI-generated responses."""
    result = await nvidia_service.generate_answer(payload.question)
    return AskResponse(
        answer=result["answer"],
        model=result["model"]
    )
