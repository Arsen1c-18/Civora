"""Authentication endpoints.

POST  /auth/register       — create a new USER account
POST  /auth/login          — email + password → access + refresh tokens
POST  /auth/refresh        — exchange a refresh token for a new access token
POST  /auth/logout         — (client-side: discard tokens; server is stateless)
GET   /auth/me             — get the current user's profile
"""

from __future__ import annotations

import logging
import os
import secrets
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
import bcrypt as _bcrypt
from pydantic import BaseModel, EmailStr, field_validator

from ..auth import (
    create_access_token,
    create_pending_token,
    create_refresh_token,
    _decode,
    get_current_user,
    get_pending_user,
)
from .. import config
from ..repositories.face_templates import face_repository
from ..services.face_service import RATE_WINDOW_SECONDS, USER_FAIL_LIMIT
from ..users_db import users_repository

logger = logging.getLogger("grievance-api")
router = APIRouter(prefix="/auth", tags=["auth"])

PRIVILEGED_ROLES = ("ADMIN", "SUPERADMIN")


def _hash_password(password: str) -> str:
    """Hash a plain-text password with bcrypt."""
    return _bcrypt.hashpw(password.encode(), _bcrypt.gensalt(12)).decode()


def _verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    if not hashed:
        return False
    try:
        return _bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


_FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")


import re

_EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


# ── Request / response models ────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str = ""
    address: str = ""
    dob: str = ""
    occupation: str = ""
    gender: str = ""
    captcha_id: str = ""
    captcha_solution: str = ""

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not _EMAIL_REGEX.match(v):
            raise ValueError("value is not a valid email address")
        return v

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name is required")
        return v.strip()


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not _EMAIL_REGEX.match(v):
            raise ValueError("value is not a valid email address")
        return v


class RefreshRequest(BaseModel):
    refresh_token: str


class PhoneOtpRequest(BaseModel):
    phone: str


class PhoneOtpVerifyRequest(BaseModel):
    phone: str
    code: str


def _phone_login_key(phone: str) -> str:
    import hashlib
    import hmac
    return hmac.new(
        config.OTP_HASH_SECRET.encode(), f"phone_login:{phone}".encode(), hashlib.sha256
    ).hexdigest()


# ── Helper ───────────────────────────────────────────────────────────────────

def _user_to_profile(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user.get("email"),
        "phone": user.get("phone"),
        "citizen_id": user.get("citizen_id"),
        "auth_method": user.get("auth_method", "password"),
        "full_name": user.get("full_name", ""),
        "role": user.get("role", "USER"),
        "departmentId": user.get("departmentId"),
        "avatar_url": user.get("avatar_url"),
        "phoneVerifiedAt": user.get("phoneVerifiedAt"),
        "phoneVerifiedMethod": user.get("phoneVerifiedMethod"),
        "smsConsent": user.get("smsConsent", False),
        "smsOptOutAt": user.get("smsOptOutAt"),
        "address": user.get("address"),
        "dob": user.get("dob"),
        "occupation": user.get("occupation"),
        "gender": user.get("gender"),
    }


def _token_response(user: dict) -> dict:
    return {
        "access_token": create_access_token(user["id"], user["role"], user["email"], user.get("departmentId")),
        "refresh_token": create_refresh_token(user["id"]),
        "token_type": "bearer",
        "user": _user_to_profile(user),
    }


def _face_step_required(user: dict) -> bool:
    """True when this privileged login pauses for the *optional* face step.

    Face is never mandatory (DEC-024): the step only appears when face auth
    is enabled, the account is privileged AND enrolled with `requireLogin2fa`.
    Superadmin is always exempt from 2FA (DEC-052).
    The decision reads only the verify-second-factor counter
    (`face:fail:user:<id>`) — a public /auth/face/login lockout can never
    influence password login, and vice versa.
    """
    if not config.FACE_AUTH_ENABLED:
        return False
    if user.get("role") == "SUPERADMIN":
        return False
    if user.get("role") not in PRIVILEGED_ROLES:
        return False
    template = face_repository.get_template(user.get("id", ""))
    if not template or not template.get("requireLogin2fa"):
        return False
    key = f"face:fail:user:{user['id']}"
    return face_repository.rate_count(key, RATE_WINDOW_SECONDS) < USER_FAIL_LIMIT


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/register", status_code=201)
def register(payload: RegisterRequest):
    """Create a new citizen account.  Email must be unique."""
    from ..profile_fields import validate_profile
    from ..services.captcha import verify_captcha
    try:
        profile = validate_profile(
            payload.address, payload.dob, payload.occupation, payload.gender)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    if not verify_captcha(payload.captcha_id, payload.captcha_solution):
        raise HTTPException(status_code=400, detail="Captcha verification failed")
    if users_repository.find_by_email(payload.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    phone_clean: str | None = None
    if payload.phone.strip():
        from ..users_db import normalize_phone
        try:
            phone_clean = normalize_phone(payload.phone)
        except ValueError:
            raise HTTPException(status_code=400, detail="Enter a valid Indian mobile number")
        if users_repository.find_by_phone(phone_clean):
            raise HTTPException(status_code=409, detail="This phone number is already registered")

    user_id = users_repository.create({
        "email": payload.email.lower(),
        "full_name": payload.full_name,
        "hashed_password": _hash_password(payload.password),
        "role": "USER",
        "phone": phone_clean,
        "phoneVerifiedAt": None,
        "phoneVerifiedMethod": None,
        **profile,
    })
    user = users_repository.get(user_id)
    return _token_response(user)


@router.get("/captcha")
def get_captcha(request: Request):
    """Mint a self-hosted text captcha (5-min, single-use). Public."""
    from ..services.captcha import mint_captcha
    ip = request.client.host if request.client else "unknown"
    allowed, _remaining = face_repository.rate_hit(f"captcha:ip:{ip}", 60, 3600)
    if not allowed:
        raise HTTPException(status_code=429, detail="Too many captcha requests")
    return mint_captcha()


@router.post("/login")
def login(payload: LoginRequest):
    """Email + password → access + refresh tokens.

    When face auth is enabled and a privileged account has opted into the
    extra face step (enrolled + `requireLogin2fa`, not currently locked out
    of the face endpoint), the response is a short-lived pending token
    instead — password login itself always succeeds.
    """
    user = users_repository.find_by_email(payload.email)
    if (
        not user
        or user.get("auth_method") == "face_only"
        or not _verify_password(payload.password, user.get("hashed_password") or "")
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if _face_step_required(user):
        return {
            "two_factor": "face",
            "token_type": "bearer",
            "pending_token": create_pending_token(
                user["id"], user["role"], user["email"], user.get("departmentId")
            ),
        }
    return _token_response(user)


@router.post("/login/phone/request-otp")
def phone_login_request_otp(payload: PhoneOtpRequest, request: Request):
    """Issue a login OTP for a verified citizen number. Public and generic:
    unknown or unverified numbers get the same response (no oracle), only
    without an SMS. Rate-limited per phone + IP like the binding flow."""
    from ..services.sms import send_otp_code
    from ..users_db import normalize_phone
    try:
        phone = normalize_phone(payload.phone)
    except ValueError:
        raise HTTPException(status_code=400, detail="Enter a valid Indian mobile number")
    ip = request.client.host if request.client else "unknown"
    import hashlib
    phone_key = hashlib.sha256(phone.encode()).hexdigest()
    ip_key = hashlib.sha256(ip.encode()).hexdigest()
    for key, limit in ((f"phone_login:user:{phone_key}", 5),
                       (f"phone_login:ip:{ip_key}", 10)):
        allowed, _remaining = face_repository.rate_hit(key, limit, 3600)
        if not allowed:
            raise HTTPException(status_code=429, detail="Too many verification requests. Try again later.")
    user = users_repository.find_by_phone(phone)
    issued_code: str | None = None
    if user and user.get("role") == "USER" and user.get("phoneVerifiedAt"):
        import secrets
        code = f"{secrets.randbelow(1_000_000):06d}"
        key = _phone_login_key(phone)
        from ..repositories.otp_codes import otp_repository
        otp_repository.put(key, _otp_hash_for_login(key, code), "phone_login", 300)
        send_otp_code(phone, code)
        issued_code = code
    result: dict = {"message": "If this number can receive codes, one has been issued.", "expires_in": 300}
    if issued_code and config.OTP_DEBUG_RETURN_CODE and config.SMS_PROVIDER == "dry-run":
        result["debug_code"] = issued_code
    return result


def _otp_hash_for_login(key: str, code: str) -> str:
    import hashlib
    import hmac
    return hmac.new(
        config.OTP_HASH_SECRET.encode(), f"{key}:{code}".encode(), hashlib.sha256
    ).hexdigest()


@router.post("/login/phone/verify")
def phone_login_verify(payload: PhoneOtpVerifyRequest):
    """Exchange a login OTP for tokens. Citizens (USER) with a verified
    number only; everything else gets the same generic failure."""
    from ..repositories.otp_codes import otp_repository
    try:
        from ..users_db import normalize_phone
        phone = normalize_phone(payload.phone)
    except ValueError:
        raise HTTPException(status_code=400, detail="Verification failed or expired")
    key = _phone_login_key(phone)
    challenge = otp_repository.get(key)
    if not challenge or challenge.get("purpose") != "phone_login":
        raise HTTPException(status_code=400, detail="Verification failed or expired")
    import hmac
    if not hmac.compare_digest(challenge["hash"], _otp_hash_for_login(key, (payload.code or "").strip())):
        otp_repository.fail(key)
        raise HTTPException(status_code=400, detail="Verification failed or expired")
    user = users_repository.find_by_phone(phone)
    if not user or user.get("role") != "USER" or not user.get("phoneVerifiedAt"):
        otp_repository.fail(key)
        raise HTTPException(status_code=400, detail="Verification failed or expired")
    otp_repository.consume(key)
    if _face_step_required(user):
        return {
            "two_factor": "face",
            "token_type": "bearer",
            "pending_token": create_pending_token(
                user["id"], user["role"], user["email"], user.get("departmentId")
            ),
        }
    return _token_response(user)


@router.post("/complete-pending")
def complete_pending(current: Annotated[dict, Depends(get_pending_user)]):
    """Exchange a pending token for the full token response.

    Lockout escape hatch only (DEC-024): while the account can still attempt
    face verification, the pending token must be used for
    /auth/face/verify-second-factor and is rejected here (403) — it never
    grants protected access on its own. Once the account is locked out of the
    face endpoint (face:fail:user:{id} at the limit) the face step cannot be
    taken, so the pending token is completed directly. The face step is an
    optional convenience, never a hard requirement.
    """
    user = users_repository.get(current["user_id"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    key = f"face:fail:user:{user['id']}"
    if face_repository.rate_count(key, RATE_WINDOW_SECONDS) < USER_FAIL_LIMIT:
        raise HTTPException(status_code=403, detail="Face verification required")
    return _token_response(user)


@router.post("/refresh")
def refresh(payload: RefreshRequest):
    """Exchange a valid refresh token for a new access token."""
    data = _decode(payload.refresh_token)
    if data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user = users_repository.get(data["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {
        "access_token": create_access_token(user["id"], user["role"], user["email"], user.get("departmentId")),
        "token_type": "bearer",
    }


@router.get("/me")
def me(current: Annotated[dict, Depends(get_current_user)]):
    """Return the authenticated user's profile."""
    user = users_repository.get(current["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_to_profile(user)

