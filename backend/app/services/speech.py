"""Gnani Prisma/Timbre transport. Never log audio, synthesized text or secrets."""

import asyncio
import logging
import time
from datetime import datetime, timezone

import httpx
from fastapi import HTTPException

from .. import config

logger = logging.getLogger(__name__)
BASE_URL = "https://api.vachana.ai"
STT_ENDPOINT = f"{BASE_URL}/stt/v3"
TTS_ENDPOINT = f"{BASE_URL}/api/v1/tts/inference"
STT_LANGUAGES = {
    "bn-IN", "en-IN", "gu-IN", "hi-IN", "kn-IN", "ml-IN", "mr-IN",
    "pa-IN", "ta-IN", "te-IN",
}
TTS_LANGUAGES = STT_LANGUAGES
TTS_VOICES = {
    "bn-IN": "Kirra", "en-IN": "Kaveri", "gu-IN": "Falak", "hi-IN": "Nalini",
    "kn-IN": "Saanvi", "ml-IN": "Reshma", "mr-IN": "Zahira", "pa-IN": "Mehuli",
    "ta-IN": "Asmita", "te-IN": "Suhana",
}
MAX_RESPONSE_BYTES = 8 * 1024 * 1024


def make_client() -> httpx.AsyncClient:
    timeout = config.GNANI_TIMEOUT_SECONDS
    return httpx.AsyncClient(timeout=httpx.Timeout(timeout, connect=5), follow_redirects=False, trust_env=False)


def _usage(model: str, operation: str, quantity: int, started: float, success: bool) -> None:
    # Metadata only: never include user text, audio, keys or upstream response bodies.
    measure = "audio_bytes" if operation == "transcribe" else "characters"
    logger.info("speech_usage model=%s operation=%s request_timestamp=%s %s=%d success=%s latency_ms=%d",
                model, operation, datetime.now(timezone.utc).isoformat(), measure, quantity,
                success, int((time.monotonic() - started) * 1000))


async def transcribe(audio: bytes, language: str) -> dict:
    if language not in STT_LANGUAGES:
        raise HTTPException(400, "Unsupported Prisma language")
    started = time.monotonic()
    try:
        async with asyncio.timeout(config.GNANI_TIMEOUT_SECONDS):
            async with make_client() as client:
                response = await client.post(
                    config.GNANI_PRISMA_ENDPOINT or STT_ENDPOINT,
                    headers={"X-API-Key-ID": config.GNANI_API_KEY},
                    files={"audio_file": ("recording.wav", audio, "audio/wav")},
                    data={"model": config.GNANI_PRISMA_MODEL, "language_code": language},
                )
        if response.status_code in (402, 403, 429):
            raise HTTPException(503, "Transcription provider unavailable; contact the operator")
        if response.status_code != 200 or len(response.content) > 64 * 1024:
            raise HTTPException(502, "Transcription provider failed")
        raw = response.json()
    except (TimeoutError, httpx.TimeoutException):
        _usage(config.GNANI_PRISMA_MODEL, "transcribe", len(audio), started, False)
        raise HTTPException(504, "Transcription timed out; this attempt may have consumed credits") from None
    except HTTPException:
        _usage(config.GNANI_PRISMA_MODEL, "transcribe", len(audio), started, False)
        raise
    except (httpx.RequestError, ValueError, RecursionError):
        _usage(config.GNANI_PRISMA_MODEL, "transcribe", len(audio), started, False)
        raise HTTPException(502, "Transcription provider unavailable or returned invalid data") from None
    if not isinstance(raw, dict) or raw.get("success") is False:
        _usage(config.GNANI_PRISMA_MODEL, "transcribe", len(audio), started, False)
        raise HTTPException(502, "Invalid transcription provider response")
    text = raw.get("transcript")
    detected = raw.get("detected_language_code")
    request_id = raw.get("request_id")
    if (not isinstance(text, str) or not text.strip() or len(text) > 16000
            or (detected is not None and (not isinstance(detected, str) or detected not in STT_LANGUAGES))
            or (request_id is not None and (not isinstance(request_id, str) or len(request_id) > 200))):
        _usage(config.GNANI_PRISMA_MODEL, "transcribe", len(audio), started, False)
        raise HTTPException(502, "Invalid transcription provider response")
    result = {"transcript": text, "language_code": detected or language}
    if request_id:
        result["request_id"] = request_id
    _usage(config.GNANI_PRISMA_MODEL, "transcribe", len(audio), started, True)
    return result


async def synthesize(text: str, language: str) -> bytes:
    if not text.strip() or len(text) > config.GNANI_TTS_MAX_CHARACTERS:
        raise HTTPException(400, "Text must contain 1 to the configured maximum characters")
    if language not in TTS_LANGUAGES:
        raise HTTPException(400, "Unsupported Timbre language")
    if config.GNANI_TIMBRE_MODEL not in {"timbre-v2.5", "timbre-v3.0"}:
        raise HTTPException(503, "Invalid Timbre model configuration")
    voice = "Shivani" if config.GNANI_TIMBRE_MODEL == "timbre-v3.0" else TTS_VOICES[language]
    started = time.monotonic()
    success = False
    try:
        async with asyncio.timeout(config.GNANI_TIMEOUT_SECONDS):
            async with make_client() as client:
                async with client.stream(
                    "POST", config.GNANI_TIMBRE_ENDPOINT or TTS_ENDPOINT,
                    headers={"X-API-Key-ID": config.GNANI_API_KEY},
                    json={"text": text, "voice": voice, "model": config.GNANI_TIMBRE_MODEL,
                          "language": language, "audio_config": {"encoding": "linear_pcm", "container": "wav",
                          "num_channels": 1, "sample_rate": 48000, "sample_width": 2}},
                ) as response:
                    if response.status_code != 200:
                        raise HTTPException(502, "Speech generation provider failed")
                    if "audio/" not in response.headers.get("content-type", ""):
                        raise HTTPException(502, "Invalid speech generation response")
                    body = bytearray()
                    async for part in response.aiter_bytes():
                        if len(body) + len(part) > MAX_RESPONSE_BYTES:
                            raise HTTPException(502, "Speech generation response too large")
                        body.extend(part)
        if not body:
            raise HTTPException(502, "Empty speech generation response")
        success = True
        return bytes(body)
    except (TimeoutError, httpx.TimeoutException):
        raise HTTPException(504, "Speech generation timed out") from None
    except HTTPException:
        raise
    except httpx.RequestError:
        raise HTTPException(502, "Speech generation provider unavailable") from None
    finally:
        _usage(config.GNANI_TIMBRE_MODEL, "synthesize", len(text), started, success)
