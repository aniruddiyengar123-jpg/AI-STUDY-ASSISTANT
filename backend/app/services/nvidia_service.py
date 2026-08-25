import logging
from typing import Optional
import httpx
from fastapi import HTTPException, status
from app.config import Settings, get_settings

logger = logging.getLogger(__name__)

STUDY_ASSISTANT_SYSTEM_PROMPT = (
    "You are an expert, encouraging, and clear AI Study Assistant. "
    "Your goal is to help students learn effectively. "
    "Provide clear, accurate, and easy-to-understand explanations. "
    "When explaining concepts, use structured formatting (bullet points, numbered lists, or short code snippets where appropriate). "
    "Include a concise summary or a practical example to reinforce understanding."
)


class NvidiaService:
    """Service for interacting with NVIDIA's OpenAI-compatible hosted API."""

    def __init__(self, settings: Optional[Settings] = None):
        self.settings = settings or get_settings()

    def _validate_api_key(self) -> None:
        """Ensure an API key is configured before making external calls."""
        key = self.settings.nvidia_api_key.strip()
        if not key or key in ("your_nvidia_api_key_here", "nvapi-your-nvidia-api-key-here"):
            logger.error("NVIDIA_API_KEY is not configured or is using placeholder value.")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service is not configured. Please set a valid NVIDIA_API_KEY in the backend environment."
            )

    async def generate_answer(self, question: str) -> dict:
        """
        Sends a study question to NVIDIA's OpenAI-compatible chat completion endpoint.

        Returns a dictionary with 'answer' and 'model'.
        """
        self._validate_api_key()

        base_url = self.settings.nvidia_base_url.rstrip("/")
        endpoint = f"{base_url}/chat/completions"

        headers = {
            "Authorization": f"Bearer {self.settings.nvidia_api_key.strip()}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        payload = {
            "model": self.settings.nvidia_model,
            "messages": [
                {
                    "role": "system",
                    "content": STUDY_ASSISTANT_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": question
                }
            ],
            "temperature": 0.5,
            "max_tokens": 1024,
            "top_p": 0.9,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(endpoint, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()

            # Parse standard OpenAI-compatible choices format
            choices = data.get("choices", [])
            if not choices or not isinstance(choices, list):
                logger.error("Malformed response from NVIDIA API: missing choices.")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Received an unexpected response format from the AI service."
                )

            message = choices[0].get("message", {})
            content = message.get("content", "").strip()
            if not content:
                logger.error("Empty content in NVIDIA API response.")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="AI service returned an empty answer."
                )

            model_used = data.get("model", self.settings.nvidia_model)

            return {
                "answer": content,
                "model": model_used
            }

        except HTTPException:
            # Re-raise already sanitized HTTPExceptions
            raise

        except httpx.TimeoutException as exc:
            logger.warning("Timeout while calling NVIDIA API: %s", type(exc).__name__)
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="The AI service took too long to respond. Please try again."
            )

        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            logger.error("NVIDIA API returned HTTP error: %s", status_code)

            if status_code == 401:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Authentication failed with the AI service. Please check your API credentials."
                )
            elif status_code == 429:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="AI service rate limit exceeded. Please wait a moment before trying again."
                )
            elif status_code >= 500:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="The AI provider is currently experiencing issues. Please try again later."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Unable to process your request with the AI service. Please try again."
                )

        except httpx.RequestError as exc:
            logger.error("Network error communicating with NVIDIA API: %s", type(exc).__name__)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to reach the AI service. Please check your network connection and try again."
            )

        except Exception as exc:
            logger.error("Unexpected error in NVIDIA service: %s", type(exc).__name__)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred while generating the study answer. Please try again."
            )


def get_nvidia_service() -> NvidiaService:
    """Dependency injector for NvidiaService."""
    return NvidiaService()
