"""Explicit, authenticated Timbre generation for short citizen-facing messages."""

import asyncio
import hashlib
from collections import OrderedDict
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field

from .. import config
from ..auth import get_current_user
from ..services import speech

router = APIRouter(prefix="/speech", tags=["speech"])
_cache: OrderedDict[str, bytes] = OrderedDict()
_CACHE_MAX = 64
_synthesis_lock = asyncio.Lock()


class SynthesisRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1200)
    language_code: str = Field(min_length=2, max_length=12)


@router.post("/synthesize", response_class=Response)
async def synthesize(payload: SynthesisRequest, _user: Annotated[dict, Depends(get_current_user)]):
    if not config.GNANI_TIMBRE_ENABLED or not config.GNANI_API_KEY:
        raise HTTPException(503, "Speech generation is disabled")
    text = payload.text.strip()
    if not text:
        raise HTTPException(400, "Text cannot be empty")
    if len(text) > config.GNANI_TTS_MAX_CHARACTERS:
        raise HTTPException(413, "Text is too long for speech generation")
    if payload.language_code not in speech.TTS_LANGUAGES:
        raise HTTPException(400, "Unsupported Timbre language")
    key = hashlib.sha256(f"{config.GNANI_TIMBRE_MODEL}\0{payload.language_code}\0{text}".encode()).hexdigest()
    async with _synthesis_lock:
        audio = _cache.get(key)
        if audio is None:
            audio = await speech.synthesize(text, payload.language_code)
            _cache[key] = audio
            if len(_cache) > _CACHE_MAX:
                _cache.popitem(last=False)
        else:
            _cache.move_to_end(key)
    return Response(audio, media_type="audio/wav", headers={"Cache-Control": "private, max-age=300"})
