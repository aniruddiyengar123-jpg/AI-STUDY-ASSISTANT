import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.routers import health_router, ask_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("ai_study_assistant")

settings = get_settings()

app = FastAPI(
    title="AI Study Assistant API",
    description="FastAPI Backend for AI Study Assistant powered by NVIDIA API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Format request validation errors to be user-friendly."""
    logger.warning("Validation error on %s: %s", request.url.path, exc.errors())
    errors = exc.errors()
    if errors and len(errors) > 0:
        first_err = errors[0]
        field = first_err.get("loc", ["field"])[-1]
        msg = first_err.get("msg", "Invalid input")
        detail_msg = f"Invalid input for '{field}': {msg}"
    else:
        detail_msg = "Please provide a valid question."

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": detail_msg}
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler to ensure raw exceptions are never returned to clients."""
    logger.error("Unhandled exception processing %s: %s", request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again later."}
    )


# Register routers
app.include_router(health_router)
app.include_router(ask_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
