from pydantic import BaseModel, Field, field_validator


class AskRequest(BaseModel):
    """Payload for asking a study question."""
    question: str = Field(
        ...,
        min_length=2,
        max_length=2000,
        description="The student's question to be answered by the AI study assistant",
        examples=["What is a Python list?"]
    )

    @field_validator("question")
    @classmethod
    def validate_question_not_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Question cannot be blank or contain only whitespace.")
        return stripped


class AskResponse(BaseModel):
    """Response containing the AI generated answer and model information."""
    answer: str = Field(
        ...,
        description="Detailed, structured answer from the AI study assistant"
    )
    model: str = Field(
        ...,
        description="The model identifier used to generate the answer"
    )


class HealthResponse(BaseModel):
    """Response for API health check."""
    status: str = Field(default="healthy", description="Service health status")
    service: str = Field(default="AI Study Assistant API", description="Service name")
    version: str = Field(default="1.0.0", description="API Version")


class ErrorResponse(BaseModel):
    """Standardized user-friendly error response."""
    detail: str = Field(..., description="User-friendly error message")
