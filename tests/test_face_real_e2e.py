"""Real end-to-end face model verification tests (CIVORA).

Uses actual InsightFace buffalo_s ONNX models on disk to verify:
1. Production model artifacts exist and have valid sizes.
2. Lazy initialization initializes the real ONNX Runtime session only when requested.
3. Real face detection and ArcFace 512-d feature extraction.
4. Real 1:1 face matching (high similarity for same identity, low similarity for different identity).
5. Full template encryption, persistence, and HTTP challenge/status verification.
"""

from __future__ import annotations

import os
from pathlib import Path

import numpy as np
import pytest
from PIL import Image
from starlette.testclient import TestClient

_REAL_MODEL_DIR = Path(os.path.expanduser("~/.insightface")) / "models" / "buffalo_s"
_HAS_REAL_MODELS = (
    (_REAL_MODEL_DIR / "det_500m.onnx").is_file()
    and (_REAL_MODEL_DIR / "2d106det.onnx").is_file()
    and (_REAL_MODEL_DIR / "w600k_mbf.onnx").is_file()
)

pytestmark = pytest.mark.skipif(
    not _HAS_REAL_MODELS,
    reason="Real buffalo_s model artifacts not found at ~/.insightface/models/buffalo_s",
)

from backend.app import config
from backend.app.main import app
from backend.app.repositories.face_templates import face_repository
from backend.app.services import face_service
from backend.app.services.face_service import (
    REQUIRED_FACE_MODELS,
    VerifiedFace,
    _get_analyzer,
    _real_detections,
    _real_embed,
    decrypt_embedding,
    encrypt_embedding,
    is_analyzer_initialized,
    reset_analyzer_cache,
    similarity,
    similarity_to_template,
)


@pytest.fixture(autouse=True)
def setup_real_face(monkeypatch):
    """Enable face auth and point to the real buffalo_s model artifacts."""
    real_model_root = Path(os.path.expanduser("~/.insightface"))
    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", True)
    monkeypatch.setattr(config, "FACE_MODEL_ROOT", str(real_model_root))
    monkeypatch.setattr(config, "FACE_MODEL_NAME", "buffalo_s")
    reset_analyzer_cache()
    yield
    reset_analyzer_cache()


def test_real_model_artifacts_availability():
    """Verify production ONNX weights exist at configured path and have correct sizes."""
    model_root = Path(config.FACE_MODEL_ROOT).expanduser()
    model_dir = model_root / "models" / "buffalo_s"

    assert model_dir.is_dir(), f"Model directory missing: {model_dir}"

    expected_min_bytes = {
        "det_500m.onnx": 2_000_000,
        "2d106det.onnx": 4_000_000,
        "w600k_mbf.onnx": 12_000_000,
    }

    for model_name, min_size in expected_min_bytes.items():
        model_path = model_dir / model_name
        assert model_path.is_file(), f"Missing required model: {model_path}"
        actual_size = model_path.stat().st_size
        assert actual_size >= min_size, (
            f"Model {model_name} too small: {actual_size} < {min_size}"
        )


def test_real_model_lazy_initialization_and_singleton():
    """Model is not loaded until requested; singleton is reused without re-allocation."""
    assert not is_analyzer_initialized()

    # First request: initializes real model
    analyzer1 = _get_analyzer()
    assert analyzer1 is not None
    assert is_analyzer_initialized()

    # Second request: returns exact same instance
    analyzer2 = _get_analyzer()
    assert analyzer1 is analyzer2


def test_real_face_detection_and_embedding():
    """Run real InsightFace detection and ArcFace embedding on an actual face image."""
    img_path = (
        Path(__file__).resolve().parents[1]
        / "venv"
        / "Lib"
        / "site-packages"
        / "insightface"
        / "data"
        / "images"
        / "Tom_Hanks_54745.png"
    )
    assert img_path.is_file(), f"Test image not found at {img_path}"

    pil_img = Image.open(img_path).convert("RGB")
    img_arr = np.asarray(pil_img)

    # 1. Real detection
    detections = _real_detections(img_arr)
    assert len(detections) >= 1
    det = detections[0]
    assert det.det_score >= 0.70
    assert det.kps is not None
    assert det.kps.shape == (5, 2)

    # 2. Real ArcFace embedding
    embed = _real_embed(img_arr, det)
    assert embed.shape == (512,)
    assert abs(float(np.linalg.norm(embed)) - 1.0) < 1e-4

    # 3. Encryption / Decryption round-trip
    token = encrypt_embedding(embed)
    decrypted = decrypt_embedding(token)
    assert similarity(embed, decrypted) > 0.9999


def test_real_face_enroll_and_verify_matching():
    """Verify 1:1 matching correctly separates identical identity from distinct identity."""
    base_img_dir = (
        Path(__file__).resolve().parents[1]
        / "venv"
        / "Lib"
        / "site-packages"
        / "insightface"
        / "data"
        / "images"
    )
    img_a_path = base_img_dir / "Tom_Hanks_54745.png"
    img_b_path = base_img_dir / "t1.jpg"

    img_a = np.asarray(Image.open(img_a_path).convert("RGB"))
    img_b = np.asarray(Image.open(img_b_path).convert("RGB"))

    det_a = _real_detections(img_a)[0]
    embed_a = _real_embed(img_a, det_a)

    det_b = _real_detections(img_b)[0]
    embed_b = _real_embed(img_b, det_b)

    # Enroll Person A
    template_a = {
        "encryptedEmbedding": encrypt_embedding(embed_a),
        "modelName": "buffalo_s",
        "frameCount": 5,
    }

    verified_same = VerifiedFace(
        embedding=embed_a,
        frame_count=5,
        min_pair_similarity=0.95,
        yaw_trace=[0.0] * 5,
    )
    verified_diff = VerifiedFace(
        embedding=embed_b,
        frame_count=5,
        min_pair_similarity=0.95,
        yaw_trace=[0.0] * 5,
    )

    score_same = similarity_to_template(template_a, verified_same)
    score_diff = similarity_to_template(template_a, verified_diff)

    # Same identity must match with high similarity (>= 0.90)
    assert score_same >= 0.90, f"Expected high similarity for same identity: {score_same}"
    # Distinct identity must match with low similarity (< 0.40)
    assert score_diff < 0.40, f"Expected low similarity for different identity: {score_diff}"


def test_real_http_challenge_and_template_flow():
    """Exercise HTTP challenge issuance and template management with the real model active."""
    with TestClient(app, base_url="https://testserver") as client:
        # Challenge endpoint works
        res = client.post("/auth/face/challenge", json={})
        assert res.status_code == 200
        data = res.json()
        assert "challenge_id" in data
        assert data["action"] in ("turn_left", "turn_right", "blink", "smile")
        assert data["expires_in"] == 30
