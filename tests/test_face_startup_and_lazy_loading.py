"""Tests for face model startup audit and lazy initialization (CIVORA).

Verifies:
1. Application startup never invokes `_get_analyzer()` or spawns face warmup threads.
2. `_get_analyzer()` is initialized lazily and cached thread-safely.
3. Missing InsightFace or ONNX Runtime dependencies produce controlled SERVICE_UNAVAILABLE.
4. Missing model directory or model weights fail closed with SERVICE_UNAVAILABLE
   and NEVER trigger automatic InsightFace model downloads.
"""

from __future__ import annotations

import sys
import threading
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from starlette.testclient import TestClient

from backend.app import config
from backend.app.main import app
from backend.app.services import face_service
from backend.app.services.face_service import (
    REQUIRED_FACE_MODELS,
    FaceAuthError,
    _get_analyzer,
    reset_analyzer_cache,
)


@pytest.fixture(autouse=True)
def _cleanup_cache():
    reset_analyzer_cache()
    yield
    reset_analyzer_cache()


def test_startup_does_not_invoke_face_analyzer(monkeypatch):
    """Confirm application startup never calls _get_analyzer or spawns warmup thread."""
    called = []

    def _spy_get_analyzer():
        called.append(True)
        raise RuntimeError("Startup must not invoke _get_analyzer!")

    monkeypatch.setattr(face_service, "_get_analyzer", _spy_get_analyzer)

    # Trigger startup events
    with TestClient(app) as client:
        res = client.get("/health")
        assert res.status_code == 200

    # Ensure _get_analyzer was never called during startup
    assert called == [], "Application startup invoked _get_analyzer()!"

    # Ensure no face-model-warmup background thread exists
    active_thread_names = [t.name for t in threading.enumerate()]
    assert "face-model-warmup" not in active_thread_names, (
        f"Found unexpected warmup thread in active threads: {active_thread_names}"
    )


def test_get_analyzer_when_insightface_missing(monkeypatch):
    """InsightFace missing raises SERVICE_UNAVAILABLE and caches the failure."""
    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", True)
    real_import = __import__

    def mock_import(name, *args, **kwargs):
        if "insightface" in name:
            raise ModuleNotFoundError(f"No module named '{name}'")
        return real_import(name, *args, **kwargs)

    monkeypatch.setattr("builtins.__import__", mock_import)

    # First attempt raises SERVICE_UNAVAILABLE
    with pytest.raises(FaceAuthError) as exc_info:
        _get_analyzer()
    assert exc_info.value.code == "SERVICE_UNAVAILABLE"
    assert "face authentication dependencies are not installed" in exc_info.value.message

    # Second attempt immediately returns cached error without re-importing
    with pytest.raises(FaceAuthError) as exc_info2:
        _get_analyzer()
    assert exc_info2.value.code == "SERVICE_UNAVAILABLE"


def test_get_analyzer_when_onnxruntime_missing(monkeypatch):
    """ONNX Runtime missing raises SERVICE_UNAVAILABLE."""
    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", True)
    # Mock insightface as present
    fake_insightface = MagicMock()
    monkeypatch.setitem(sys.modules, "insightface", fake_insightface)
    monkeypatch.setitem(sys.modules, "insightface.app", fake_insightface)

    real_import = __import__

    def mock_import(name, *args, **kwargs):
        if name == "onnxruntime":
            raise ModuleNotFoundError("No module named 'onnxruntime'")
        return real_import(name, *args, **kwargs)

    monkeypatch.setattr("builtins.__import__", mock_import)

    with pytest.raises(FaceAuthError) as exc_info:
        _get_analyzer()
    assert exc_info.value.code == "SERVICE_UNAVAILABLE"
    assert "onnxruntime is not installed" in exc_info.value.message


def test_get_analyzer_when_model_dir_missing(monkeypatch, tmp_path):
    """Missing model directory fails closed without calling prepare() (no auto-download)."""
    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", True)
    fake_insightface = MagicMock()
    mock_analyzer = MagicMock()
    fake_insightface.app.FaceAnalysis.return_value = mock_analyzer
    monkeypatch.setitem(sys.modules, "insightface", fake_insightface)
    monkeypatch.setitem(sys.modules, "insightface.app", fake_insightface.app)

    fake_ort = MagicMock()
    monkeypatch.setitem(sys.modules, "onnxruntime", fake_ort)

    non_existent_root = tmp_path / "does_not_exist"
    monkeypatch.setattr(config, "FACE_MODEL_ROOT", str(non_existent_root))

    with pytest.raises(FaceAuthError) as exc_info:
        _get_analyzer()

    assert exc_info.value.code == "SERVICE_UNAVAILABLE"
    assert "face model weights not found" in exc_info.value.message
    # Critical: prepare() was NEVER called, which means InsightFace did not trigger download_and_extract
    mock_analyzer.prepare.assert_not_called()


def test_get_analyzer_when_model_weights_incomplete(monkeypatch, tmp_path):
    """Partial model pack missing required ONNX files fails closed without downloading."""
    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", True)
    fake_insightface = MagicMock()
    mock_analyzer = MagicMock()
    fake_insightface.app.FaceAnalysis.return_value = mock_analyzer
    monkeypatch.setitem(sys.modules, "insightface", fake_insightface)
    monkeypatch.setitem(sys.modules, "insightface.app", fake_insightface.app)

    fake_ort = MagicMock()
    monkeypatch.setitem(sys.modules, "onnxruntime", fake_ort)

    model_dir = tmp_path / "models" / config.FACE_MODEL_NAME
    model_dir.mkdir(parents=True)
    # Only create 1 file, missing the remaining 2 required models
    (model_dir / "det_500m.onnx").write_bytes(b"dummy")

    monkeypatch.setattr(config, "FACE_MODEL_ROOT", str(tmp_path))

    with pytest.raises(FaceAuthError) as exc_info:
        _get_analyzer()

    assert exc_info.value.code == "SERVICE_UNAVAILABLE"
    assert "face model weights missing" in exc_info.value.message
    assert "2d106det.onnx" in exc_info.value.message
    assert "w600k_mbf.onnx" in exc_info.value.message
    mock_analyzer.prepare.assert_not_called()


def test_get_analyzer_success_lazy_and_cached(monkeypatch, tmp_path):
    """When models exist, analyzer initializes lazily, configures memory, and caches singleton."""
    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", True)
    fake_insightface = MagicMock()
    mock_analyzer = MagicMock()
    fake_insightface.app.FaceAnalysis.return_value = mock_analyzer
    monkeypatch.setitem(sys.modules, "insightface", fake_insightface)
    monkeypatch.setitem(sys.modules, "insightface.app", fake_insightface.app)

    fake_ort = MagicMock()
    mock_opts = MagicMock()
    fake_ort.SessionOptions.return_value = mock_opts
    monkeypatch.setitem(sys.modules, "onnxruntime", fake_ort)

    # Populate all required model files
    model_dir = tmp_path / "models" / config.FACE_MODEL_NAME
    model_dir.mkdir(parents=True)
    for model_file in REQUIRED_FACE_MODELS:
        (model_dir / model_file).write_bytes(b"mock_weights")

    monkeypatch.setattr(config, "FACE_MODEL_ROOT", str(tmp_path))

    # First call: initializes
    analyzer1 = _get_analyzer()
    assert analyzer1 is mock_analyzer
    assert fake_insightface.app.FaceAnalysis.call_count == 1
    mock_analyzer.prepare.assert_called_once()
    # Check session options configured for low memory
    assert mock_opts.intra_op_num_threads == config.FACE_ORT_THREADS
    assert mock_opts.inter_op_num_threads == 1
    assert mock_opts.enable_cpu_mem_arena is False

    # Second call: returns cached singleton without re-initializing
    analyzer2 = _get_analyzer()
    assert analyzer2 is mock_analyzer
    assert fake_insightface.app.FaceAnalysis.call_count == 1


def test_get_analyzer_thread_safe_concurrent_initialization(monkeypatch, tmp_path):
    """Multiple concurrent threads calling _get_analyzer() only initialize once."""
    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", True)
    fake_insightface = MagicMock()
    mock_analyzer = MagicMock()
    fake_insightface.app.FaceAnalysis.return_value = mock_analyzer
    monkeypatch.setitem(sys.modules, "insightface", fake_insightface)
    monkeypatch.setitem(sys.modules, "insightface.app", fake_insightface.app)

    fake_ort = MagicMock()
    monkeypatch.setitem(sys.modules, "onnxruntime", fake_ort)

    model_dir = tmp_path / "models" / config.FACE_MODEL_NAME
    model_dir.mkdir(parents=True)
    for model_file in REQUIRED_FACE_MODELS:
        (model_dir / model_file).write_bytes(b"mock_weights")

    monkeypatch.setattr(config, "FACE_MODEL_ROOT", str(tmp_path))

    results = []
    barrier = threading.Barrier(5)

    def _worker():
        barrier.wait()
        results.append(_get_analyzer())

    threads = [threading.Thread(target=_worker) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert len(results) == 5
    assert all(r is mock_analyzer for r in results)
    assert fake_insightface.app.FaceAnalysis.call_count == 1


def test_face_auth_disabled_blocks_get_analyzer(monkeypatch):
    """When FACE_AUTH_ENABLED=false, _get_analyzer immediately raises without loading models."""
    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", False)

    with pytest.raises(FaceAuthError) as exc_info:
        _get_analyzer()

    assert exc_info.value.code == "SERVICE_UNAVAILABLE"
    assert "face authentication is disabled" in exc_info.value.message
    assert not face_service.is_analyzer_initialized()


def test_face_auth_disabled_blocks_face_routes(monkeypatch):
    """When FACE_AUTH_ENABLED=false, face routes return 404 via FaceRouteGuard."""
    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", False)

    with TestClient(app) as client:
        res = client.post("/auth/face/challenge", json={})
        assert res.status_code == 404


def test_face_auth_disabled_startup_logging(monkeypatch, caplog):
    """When FACE_AUTH_ENABLED=false, startup logs show disabled state clearly."""
    import logging
    from backend.app.main import _validate_face_auth

    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", False)

    with caplog.at_level(logging.INFO):
        _validate_face_auth()

    assert any(
        "[STARTUP] Face authentication: DISABLED" in record.message
        for record in caplog.records
    )


def test_face_auth_enabled_startup_logging(monkeypatch, caplog):
    """When FACE_AUTH_ENABLED=true, startup logs show enabled state with lazy status."""
    import logging
    from cryptography.fernet import Fernet
    from backend.app.main import _validate_face_auth

    test_key = Fernet.generate_key().decode()
    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", True)
    monkeypatch.setattr(config, "FACE_EMBED_KEY", test_key)

    with caplog.at_level(logging.INFO):
        _validate_face_auth()

    assert any(
        "[STARTUP] Face authentication: ENABLED" in record.message and "loaded: False" in record.message
        for record in caplog.records
    )


def test_face_auth_disabled_preserves_password_login(monkeypatch):
    """Disabling face auth preserves normal password authentication without requiring 2FA."""
    from backend.app.routers.auth import _face_step_required

    monkeypatch.setattr(config, "FACE_AUTH_ENABLED", False)

    # Privileged account with 2FA required in template
    mock_user = {"id": "user-123", "role": "ADMIN"}
    assert _face_step_required(mock_user) is False

