import json
import os
from functools import lru_cache
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables and .env file."""

    nvidia_api_key: str = Field(
        default="",
        description="NVIDIA Hosted API Key"
    )
    nvidia_base_url: str = Field(
        default="https://integrate.api.nvidia.com/v1",
        description="NVIDIA OpenAI-compatible API base URL"
    )
    nvidia_model: str = Field(
        default="meta/llama-3.1-8b-instruct",
        description="Target LLM model hosted on NVIDIA NIM / API"
    )
    cors_origins: Union[List[str], str] = Field(
        default=["http://localhost:3000"],
        description="Allowed CORS origins for frontend access"
    )
    environment: str = Field(
        default="development",
        description="Runtime environment (development, test, production)"
    )
    port: int = Field(default=8000, description="API port")
    host: str = Field(default="0.0.0.0", description="API host")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
