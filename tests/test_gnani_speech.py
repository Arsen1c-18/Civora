"""Gnani speech transport tests use mock HTTP only; no API keys or paid calls."""

import httpx
import json
import pytest

from backend.app import config
from backend.app.auth import create_access_token
from backend.app.routers import speech as speech_route
from backend.app.services import speech


@pytest.fixture(autouse=True)
def setup_gnani(monkeypatch):
    monkeypatch.setattr(config, "GNANI_API_KEY", "mock-only")
    monkeypatch.setattr(config, "GNANI_TIMBRE_ENABLED", True)
    monkeypatch.setattr(config, "GNANI_TIMEOUT_SECONDS", 2)
    speech_route._cache.clear()


def test_prisma_uses_documented_api_contract(monkeypatch):
    seen = []
    def provider(request):
        seen.append(request)
        return httpx.Response(200, json={"success": True, "transcript": "नमस्कार", "model": "prisma-v3.0", "detected_language_code": "hi-IN", "request_id": "abc"})
    monkeypatch.setattr(speech, "make_client", lambda: httpx.AsyncClient(transport=httpx.MockTransport(provider)))
    import asyncio
    result = asyncio.run(speech.transcribe(b"audio", "hi-IN"))
    request = seen[0]
    assert request.url == speech.STT_ENDPOINT
    assert request.headers["X-API-Key-ID"] == "mock-only"
    assert b"audio_file" in request.content and b"prisma-v3.0" in request.content
    assert result == {"transcript": "नमस्कार", "language_code": "hi-IN", "request_id": "abc"}


def test_timbre_success_and_repeated_request_uses_cache(client, monkeypatch):
    calls = []
    def provider(request):
        calls.append(request)
        assert request.url == speech.TTS_ENDPOINT
        assert request.headers["X-API-Key-ID"] == "mock-only"
        payload = json.loads(request.content)
        assert payload["model"] == "timbre-v2.5"
        assert payload["voice"] == "Nalini"
        return httpx.Response(200, content=b"RIFFmock", headers={"content-type": "audio/wav"})
    monkeypatch.setattr(speech, "make_client", lambda: httpx.AsyncClient(transport=httpx.MockTransport(provider)))
    headers = {"Authorization": f"Bearer {create_access_token('u1', 'USER')}"}
    for _ in range(2):
        response = client.post("/speech/synthesize", headers=headers, json={"text": "नमस्कार", "language_code": "hi-IN"})
        assert response.status_code == 200 and response.content == b"RIFFmock"
        assert response.headers["content-type"] == "audio/wav"
    assert len(calls) == 1


@pytest.mark.parametrize("payload,status", [({"text": "   ", "language_code": "hi-IN"}, 400), ({"text": "Hello", "language_code": "xx-IN"}, 400)])
def test_timbre_rejects_empty_or_unsupported(client, payload, status):
    headers = {"Authorization": f"Bearer {create_access_token('u1', 'USER')}"}
    assert client.post("/speech/synthesize", headers=headers, json=payload).status_code == status


def test_timbre_disabled_keeps_text_functional(client, monkeypatch):
    monkeypatch.setattr(config, "GNANI_TIMBRE_ENABLED", False)
    headers = {"Authorization": f"Bearer {create_access_token('u1', 'USER')}"}
    response = client.post("/speech/synthesize", headers=headers, json={"text": "hello", "language_code": "en-IN"})
    assert response.status_code == 503


def test_timbre_requires_authenticated_session(client):
    assert client.post("/speech/synthesize", json={"text": "hello", "language_code": "en-IN"}).status_code == 401


def test_timbre_provider_failure_is_controlled(client, monkeypatch):
    monkeypatch.setattr(speech, "make_client", lambda: httpx.AsyncClient(transport=httpx.MockTransport(lambda request: httpx.Response(503))))
    headers = {"Authorization": f"Bearer {create_access_token('u1', 'USER')}"}
    response = client.post("/speech/synthesize", headers=headers, json={"text": "hello", "language_code": "en-IN"})
    assert response.status_code == 502
