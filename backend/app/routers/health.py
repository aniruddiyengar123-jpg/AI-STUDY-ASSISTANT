from fastapi import APIRouter
from app.models.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/",
    response_model=HealthResponse,
    summary="Health check endpoint",
    description="Check the operational status of the AI Study Assistant backend."
)
async def health_check() -> HealthResponse:
    """Returns the API health status."""
    return HealthResponse(
        status="healthy",
        service="AI Study Assistant API",
        version="1.0.0"
    )
