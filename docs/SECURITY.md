# SECURITY.md — Security Design

---

## Implementation status

> **Implemented (2026-11-10):** JWT authentication with password login and
> optional phone-number OTP login, server-side role checks on every protected
> route, optional face authentication (off by default), phone binding with
> audited unbinding, and an auditable grainy history for grievance actions.
> The frontend mock mode (`NEXT_PUBLIC_USE_MOCKS=true`) exists only as an
> offline preview fallback. Single-sign-on (Google OAuth) was removed from the
> product; there are no Google sign-in routes, variables, or callbacks.
> Hardening work still ahead is listed under
> [Current limitations and future scope](#current-limitations-and-future-scope).

## Authentication

### JWT sessions

- Access tokens are short-lived (15 minutes recommended), refresh tokens live
  longer (7 days) and are rotated on use.
- Tokens are signed with `HS256` using `JWT_SECRET_KEY` from the environment;
  the secret must never be empty or committed.
- Token payload carries `{ user_id, role, exp, iat }`; verification happens on
  every protected request via FastAPI dependencies.
- Role claims are verified against the database on sensitive operations — a
  stale or forged role field cannot grant access.
- `/auth/captcha` protects public account creation from scripted registration.

### Password login

- Passwords are hashed with bcrypt; plaintext is never stored or logged.
- Minimum password length is enforced at the API level.
- `/auth/login`, `/auth/register` and `/auth/refresh` are the only password
  entry points; there is no OAuth fallback and no legacy session path.

### Phone-number login (optional)

- Login OTP: six-digit random codes, HMAC-hashed at rest, five-minute expiry,
  three attempts, invalidated by regeneration or consumption; rate limiting
  covers account, hashed phone and hashed client-IP dimensions; OTP values
  are never logged.
- `OTP_DEBUG_RETURN_CODE` is a local development dry-run escape hatch and must
  be false in any deployment.
- Phone numbers are unverified identifiers by default; binding requires a
  verified number and unbinding requires proof of control. Binding/unbinding
  events are audited with masked phone values.
- `OTP_HASH_SECRET` and `OTP_DEBUG_RETURN_CODE` are backend-only settings.

### Face authentication (optional)

> Off by default (`FACE_AUTH_ENABLED=false`); every `/auth/face/*` route
> returns 404 and the UI hides all face options when off.

**Privileged step-up is convenience, not a security control.** For
ADMIN/SUPERADMIN accounts that opt in (`requireLogin2fa`), a face check may
follow password login — but the face lockout always falls back to
password-only login, no privileged login is ever face-only, and
`POST /auth/complete-pending` exists precisely so a locked-out account can
still sign in with credentials. Treat the step as a UX hardening measure, not
an authentication factor that increases assurance.

- **1:1 verification only** — email + face match against that user's own
  template; never 1:N search across users
- **Server-side liveness** against a single-use, 30-second challenge action
  (head turn / blink / smile) with fail-closed frame quality gates (exactly
  one face, minimum bbox, blur floor, detection confidence); optional
  Silent-Face-Anti-Spoofing ONNX model (`FACE_ANTISPOOF_MODEL_PATH`)
- **Fail closed** everywhere — missing landmarks, unavailable model, or a
  broken anti-spoof path rejects the attempt rather than passing it
- **Generic errors** — all client-facing failures are the same 401; reason
  codes and similarity scores go to audit logs only
- **Lockouts** — per-IP (20) and per-email (5) on public face login, per-user
  (5) on the second-factor endpoint, 15-minute TTL; password login is
  never blocked by them. Template model drift (`MODEL_MISMATCH`) forces
  re-enrollment and never counts toward lockout.
- **Biometric data handling (DPDP):** face embeddings are personal biometric
  data. Enrollment requires explicit consent (`consent: true` + UI checkbox).
  Only the encrypted (Fernet, `FACE_EMBED_KEY`) 512-d embedding is stored —
  never images or frames. Templates are deletable on request by the owner
  (`DELETE /auth/face/template`) and revocable by admins/superadmins
  (`DELETE /auth/face/template/{user_id}`); every lifecycle event is audited
  (`face.enrolled/deleted/revoked/...`) without ever logging embeddings.
- Liveness/quality thresholds are env-tunable (`FACE_TURN_MIN_DEGREES`,
  `FACE_BLINK_EAR_DROP`, `FACE_SMILE_MOUTH_WIDEN`, `FACE_MIN_BLUR_VARIANCE`,
  `FACE_MIN_FACE_PX`) — see `backend/.env.example`.

---

## Authorization — Role-Based Access Control (RBAC)

### Roles

| Role | Description |
|---|---|
| `USER` | Grievance raiser — own grievances only |
| `RESOLVER` | Department staff — assigned grievances only |
| `ADMIN` | Full operational oversight (optionally department-scoped) |
| `SUPERADMIN` | User/role management, system configuration |

### Enforcement

- Role claims in JWT are **verified against the database** on sensitive operations
- Every protected endpoint declares required role(s) via FastAPI `Depends(require_role([...]))`
- Role checks happen server-side — frontend role-based UI is for UX only, not security
- Resource-level authorization: users can only access their own grievances; resolvers can only see assigned grievances

### Permission Matrix (Key Examples)

| Resource / Action | USER | RESOLVER | ADMIN | SUPERADMIN |
|---|---|---|---|---|
| Submit grievance | ✓ | — | ✓ | ✓ |
| View own grievance | ✓ | — | ✓ | ✓ |
| View any grievance | — | assigned only | ✓ | ✓ |
| Assign grievance | — | — | ✓ | ✓ |
| Update grievance status | — | assigned only | ✓ | ✓ |
| Submit resolution | — | ✓ (assigned) | ✓ | ✓ |
| Approve escalation | — | — | ✓ | ✓ |
| Manage categories | — | — | ✓ | ✓ |
| Manage users | — | — | — | ✓ |
| View analytics | — | limited | ✓ | ✓ |
| Access audit logs | — | — | ✓ | ✓ |

---

## Input Validation

- All request bodies validated via Pydantic v2 schemas (type enforcement, length limits)
- String fields: max length enforced, HTML/script injection prevented via sanitization
- File uploads: validated by content type and a configurable size ceiling
- Query parameters: type-coerced and bounds-checked
- Never trust client-provided role, user_id, or resource ownership claims

---

## File Attachment Security

- Attachment images are uploaded directly from the browser to Cloudinary
  (unsigned preset), then only referenced by URL from the API.
- Backend-only `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` sign audit-relevant
  operations and delete assets when a grievance record is removed; the secret
  never reaches the frontend.
- Server-side validation constrains image type (JPEG/PNG) and size (10 MB
  default) before acceptance.
- Virus scanning is not implemented today and remains on the hardening list.

---

## API Security

- **CORS is locked to exact origins.** In production the backend allows only
  the deployed frontend origin (`CORS_ORIGINS`), never a wildcard.
- **Proxy trust:** the deployment runs behind a reverse proxy (Render/Vercel),
  so `TRUST_PROXY=true` is required on the backend for correct client-IP
  accounting in rate limits and audit records.
- HTTPS is required end to end; local development is the only plaintext path.
- No sensitive data (passwords, tokens, provider keys, raw OTPs) in API
  responses or logs; errors are sanitized and never leak internal traces.
- Voice-provider calls are wrapped by bounded quotas, timeouts and
  response-size caps; provider failures are fail-closed and returned as
  sanitized contract errors (`502/503/504`).

---

## Secret Management

**Non-negotiable rules:**

- No secrets in committed source files (`.py`, `.ts`, `.env`, config files)
- `.env` files are `.gitignore`d — always
- `.env.example` files list key names and placeholder values only
- Secrets load at runtime via environment variables; provider credentials are
  stored in the hosting dashboard (Render/Vercel), never in the repository

The canonical settings are in [backend/.env.example](../backend/.env.example)
and [frontend/.env.example](../frontend/.env.example). Required groups:

- Session: `JWT_SECRET_KEY`, `CORS_ORIGINS`, `TRUST_PROXY`, `FRONTEND_URL`
- Data: `MONGODB_URI`, `MONGODB_DB`
- Speech: `GNANI_API_KEY`, `GNANI_PRISMA_ENABLED`, `GNANI_TIMBRE_ENABLED`
- Uploads: `CLOUDINARY_*` (backend secret split from the frontend preset)
- Notifications: `SMS_PROVIDER`, `TWILIO_*`, `OTP_HASH_SECRET`
- Face: `FACE_AUTH_ENABLED`, `FACE_EMBED_KEY` and tuning thresholds

---

## Audit Logging

Grievance-affecting actions are recorded (actor, action, resource,
previous value → new value, timestamp, reason, human-vs-AI provenance) in the
`audit_logs` store, with admin API access to the audit timeline:

- Grievance state transitions and reopening
- Assignment and reassignment events
- Escalation decisions
- Role changes

AI-originated suggestions are tagged separately from human decisions, e.g.
`action_source = AI_RECOMMENDATION`, in grievance history; a human decision
always overwrites an advisory suggestion in the data model.

---

## Sensitive Data Handling

- Phone numbers are masked in admin user-list output; the full number is only
  visible to the account owner on their own profile.
- User email addresses are not exposed to other users through the API
- Grievance details are only accessible to the submitter, assigned resolver, and admin
- Internal comments (`is_internal = true`) are not visible to grievance submitters
- PII in grievance text is the submitter's own data — handle with care in AI processing logs
- Face images are never stored server-side; only encrypted embeddings exist.

---

## Development vs. Production

| Setting | Development | Production |
|---|---|---|
| HTTPS | Optional | Required |
| Detailed error responses | Enabled | Disabled |
| CORS | Permissive | Exact origins only |
| JWT expiry | Long for convenience | Short (15 min access) |
| Rate limiting | Relaxed | Enforced |
| Seed accounts | Optional | Disabled (kept on for the open demo deployment) |
| Credential panel | Allowed in demo | `NEXT_PUBLIC_SHOW_DEV_CREDS=false` |

---

## Current limitations and future scope

The platform is a working prototype; the security posture is appropriate for
an open demo. The following hardening scope is planned, not a current
failure-mode situation:

1. **Password-path rate limiting.** Brute-force throttling on
   `/auth/login`, `/auth/register` and `/auth/refresh` should be added to
   match the stricter lockouts already present on face routes.
2. **Account-recovery flows.** Email verification and password reset are not
   implemented; contact-based recovery exists for lost credentials rather
   than self-service reset.
3. **Attachment hardening.** Virus scanning and richer content-type checks on
   uploaded images are ahead of implementation today.
4. **Legacy secret rotation.** A Firebase Web API key from a removed demo file
   remains in git history and should be rotated in that provider's console.
5. **Formal security review.** A dedicated penetration test and a review of
   provider data-retention (Gnani, Cloudinary, Twilio) settings remain
   scheduled operator work.
6. **Production identity providers.** SMS carrier delivery (TRAI DLT
   template registration) is pending; OTP codes work in dry-run and through
   a limited live-verification path only.

Beyond these security items, the platform-level
[limitations and future scope](../README.md#current-limitations-and-future-scope)
in the README covers language coverage, scale validation, external
government-portal integration and other product directions.
