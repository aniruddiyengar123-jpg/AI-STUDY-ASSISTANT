from unittest.mock import AsyncMock
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.nvidia_service import NvidiaService, get_nvidia_service
from app.config import Settings

client = TestClient(app)


def test_ask_validation_empty_payload():
    """Verify validation error when payload is empty."""
    response = client.post("/api/ask", json={})
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


def test_ask_validation_blank_question():
    """Verify validation error when question is blank whitespace."""
    response = client.post("/api/ask", json={"question": "   "})
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


def test_ask_success_mocked():
    """Verify successful response when NVIDIA service returns an answer."""
    mock_service = NvidiaService()
    mock_service.generate_answer = AsyncMock(return_value={
        "answer": "A Python list is an ordered, mutable collection of items.",
        "model": "meta/llama-3.1-8b-instruct"
    })

    app.dependency_overrides[get_nvidia_service] = lambda: mock_service
    try:
        response = client.post("/api/ask", json={"question": "What is a Python list?"})
        assert response.status_code == 200
        data = response.json()
        assert data["answer"] == "A Python list is an ordered, mutable collection of items."
        assert data["model"] == "meta/llama-3.1-8b-instruct"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_unconfigured_api_key():
    """Verify friendly 503 error when NVIDIA API key is missing or default."""
    test_settings = Settings(nvidia_api_key="")
    service = NvidiaService(settings=test_settings)
    
    with pytest.raises(Exception) as exc_info:
        await service.generate_answer("What is Python?")
    
    assert exc_info.value.status_code == 503
    assert "not configured" in exc_info.value.detail
