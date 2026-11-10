# CIVORA

**AI-Powered Grievance Redressal & Management Platform** — Every grievance deserves a resolution.

**Live deployment:** [civora-public-grievance.vercel.app](https://civora-public-grievance.vercel.app) · [API status](https://grievance-ai-backend-04tv.onrender.com/health) · [Interactive API documentation](https://grievance-ai-backend-04tv.onrender.com/docs)

CIVORA is a web-based grievance redressal and management platform for civic
complaints. Citizens can file a complaint by speaking as well as typing, and
staff run a role-based workflow with department analytics, maps, and
AI-assisted triage. It is an independent system, not an official government
service or a national grievance portal.

AI outputs are advisory. Authorized people make the final decisions about
department routing, employee assignment, escalation, resolution approval, and
closure.

## Why CIVORA exists — and why filing starts with voice

Most civic complaints are reported by people standing in front of the
problem, on a phone, often in a language they speak rather than write. Long
text forms lose exactly those reports. CIVORA makes spoken complaint filing
the primary drafting experience: citizens describe what happened in their own
words, the platform turns speech into a structured written grievance, and the
citizen reviews and approves every word before it enters the audited
workflow. English, Hindi, and Marathi are offered today, and the
transcription service itself understands ten Indian languages.

## Voice-first filing with Gnani

The voice experience runs on Gnani's speech models:

- **Speech to text — Gnani Prisma v3.0.** The guided intake asks short,
  bounded questions, and the citizen records explicitly, turn by turn.
  Recordings are sent to Prisma as 16 kHz mono WAV and return a transcript
  plus the detected language. The transcript lands in an editable field: the
  citizen reviews, edits, or retakes it, then submits through the normal
  grievance path. Nothing from a recording is submitted automatically.
- **Text to speech — Gnani Timbre.** Intake questions play from
  pre-recorded clips, and any dynamic spoken answer plays only when the
  citizen presses a speaker control. The same content is always available as
  text, so the workflow never depends on audio.
- **Trust guardrails.** Per-user reservation quotas and independent provider
  budgets guard every live call; requests run with bounded timeouts and
  response-size caps; provider errors are sanitized; and every call is
  usage-logged so speech spend and speech activity stay auditable.
- **Coverage.** Prisma covers ten Indian languages — Bangla, English,
  Gujarati, Hindi, Kannada, Malayalam, Marathi, Punjabi, Tamil, Telugu —
  which keeps wider regional-language intake on the product roadmap without
  a UI redesign.

Gnani Evon (LLM) is not integrated. Classification runs locally inside the
backend as described under [AI status and known
limitations](#ai-status-and-known-limitations).

Configuration is backend-only: set `GNANI_API_KEY` and enable
`GNANI_PRISMA_ENABLED` / `GNANI_TIMBRE_ENABLED`. The full API contract, env
reference, and flow guide are in
[docs/VOICE_ASSISTED_COMPLAINT.md](docs/VOICE_ASSISTED_COMPLAINT.md).

## What the system supports

| Role | Main capabilities |
|---|---|
| Citizen (`USER`) | Register and sign in; submit a complaint spoken or typed, with a location and optional attachments; track personal complaints; receive in-app updates. |
| Global administrator (`ADMIN`, without a department) | Review and route grievances, oversee queues, view analytics and maps, and manage platform work. |
| Department manager (`ADMIN`, with a department) | Work within the assigned department, allocate its grievances to employees, and manage department employee accounts. |
| Employee (`RESOLVER`) | View assigned work, acknowledge and progress tasks, add updates, raise issues, and submit work for manager review. |
| System administrator (`SUPERADMIN`) | Manage accounts, roles, departments, and system-level administration. |

The grievance workflow includes submission, classification, human department
review, employee assignment, progress updates, escalation, resolution review,
and closure. A manager assigns employees; the platform does not assign
employees autonomously.

### Main features

- Voice-first complaint drafting: guided spoken intake with Gnani Prisma
  transcription, an editable citizen-reviewed transcript, and Gnani Timbre
  spoken answers. The typed form remains available as the fallback when a
  deployment does not enable speech.
- Complaint registration requires a signed-in citizen. The form supports a
  self-location and an optional incident location, a map picker, and optional
  image evidence.
- Citizens can see their grievance status, activity timeline, and in-app
  notifications. Staff receive assignment and workflow notifications.
- Global and department-scoped staff workspaces provide grievance queues,
  employee allocation, and department-specific analytics. Administrators also
  have location maps with complaint clustering.
- Employee workspaces include assigned-task queues, task progress updates,
  issue escalation, and resolution submission for manager review.
- The citizen UI currently offers English, Hindi, and Marathi. Eight additional
  language packs are present in the source but are not offered in the language
  picker; native-language review is still needed.

## Technology

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Python 3.11+, FastAPI, Pydantic, Uvicorn |
| Persistence | MongoDB through PyMongo; process-local in-memory fallback when `MONGODB_URI` is empty |
| Authentication | JWT sessions, optional phone-number binding with OTP verification, and server-side role checks; optional face sign-in |
| Speech AI | Gnani Prisma v3.0 speech-to-text (ten Indian languages) and Gnani Timbre text-to-speech |
| Mapping and charts | Leaflet and Recharts |
| AI and text analysis | Local scikit-learn classification and keyword rules; optional Hugging Face and Groq provider fallbacks |
| Optional services | Cloudinary image uploads and Twilio SMS notifications |

The frontend calls the FastAPI REST API. AI, classification, and speech
services run inside the backend; there is no separate AI microservice.

```mermaid
flowchart LR
    Citizen[Citizens and staff] --> Web[Next.js frontend]
    Web -->|REST and JWT| API[FastAPI backend]
    API --> Store[(MongoDB or in-memory store)]
    API --> NLP[Local classification and rules]
    API --> Speech[Gnani Prisma STT and Gnani Timbre TTS]
    API -. optional .-> Providers[Groq, Hugging Face, Cloudinary, Twilio]
```

## Repository map

```text
backend/app/       FastAPI application, routers, repositories, and services
backend/data/      Research and evaluation datasets
backend/           Demo data seeder, evaluation utilities, and runtime requirements
frontend/app/      Next.js pages and role workspaces
frontend/components/ Shared UI, grievance, admin, resolver, and chart components
frontend/lib/      API client, auth session, types, i18n, and workflow utilities
frontend/public/   Static assets, including demo grievance images and voice prompts
tests/             Backend API, RBAC, repository, AI, and feature tests
tools/             Data maintenance utilities
docs/              Architecture, API, database, security, workflow, and AI guides
```

## Requirements

- Python 3.11 or newer
- Node.js 20 or newer and npm
- MongoDB 7 or a MongoDB Atlas database for persistent local data (optional for
  a quick in-memory run)

## Run locally

Use two terminals from the repository root.

### 1. Configure and start the backend

Create a Python environment and install the backend dependencies:

```bash
python -m venv .venv
# macOS or Linux
source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1

python -m pip install -r backend/requirements.txt
```

Create the local backend configuration:

```bash
cp backend/.env.example backend/.env
# Windows PowerShell: Copy-Item backend/.env.example backend/.env
```

Set a private signing key in `backend/.env`. For local development, generate
one with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Set `JWT_SECRET_KEY` to the generated value. To persist data across backend
restarts, also set `MONGODB_URI` to a local or sandbox MongoDB connection string
and keep `MONGODB_DB=grievance`. If `MONGODB_URI` is empty, the API uses
in-memory repositories and all data is lost when the backend process stops.

For an isolated local demonstration, the following settings seed the default
admin and the department manager/employee accounts:

```dotenv
SEED_ADMIN_EMAIL=admin@grievance.local
SEED_ADMIN_PASSWORD=Admin@2026!
SEED_TEST_ACCOUNTS=true
```

`citizen@grievance.local` is seeded automatically. Test accounts are created
only if missing; existing accounts and their passwords are left unchanged.
Keep account seeding disabled on public or production deployments.

Start the API from the repository root:

```bash
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 10000
```

The API runs at `http://127.0.0.1:10000`. Interactive API documentation is at
`http://127.0.0.1:10000/docs`; the health endpoint is
`http://127.0.0.1:10000/health`.

### 2. Configure and start the frontend

In the second terminal:

```bash
cd frontend
npm ci
```

Create `frontend/.env.local` from the example:

```bash
cp .env.example .env.local
# Windows PowerShell: Copy-Item .env.example .env.local
```

Set these values for the local API and seeded demo accounts:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:10000
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_SHOW_DEV_CREDS=true
```

`NEXT_PUBLIC_USE_MOCKS` defaults to `true` in the example file. Set it to
`false` to use the FastAPI backend and its database. The development credential
panel is for isolated evaluation only; never enable it in a public deployment.

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000`. Restart the frontend after changing any
`NEXT_PUBLIC_*` setting.

To exercise the voice-first intake locally, set `GNANI_API_KEY` and
`GNANI_PRISMA_ENABLED=true` in `backend/.env` (and
`GNANI_TIMBRE_ENABLED=true` for spoken answers). Without them the guided
intake runs on typed entry only.

### Useful routes

| Route | Purpose |
|---|---|
| `/` | Public home and dashboard |
| `/login` and `/register` | Sign in and citizen account registration |
| `/submit` | Authenticated citizen complaint form, with voice-first drafting |
| `/track` | Signed-in citizen grievance tracking |
| `/notifications` | Account notification inbox |
| `/admin` | Administrator overview and grievance queue |
| `/admin/employees` | Department employee accounts and task allocation |
| `/admin/analytics` | Role-scoped analytics and map |
| `/resolver` | Employee assigned-task workspace |
| `/superadmin` | System account and department administration |
| `/profile` | Citizen account profile |

## Demo accounts

The following default credentials are for an isolated demo database only.
Change them and disable development credential display before exposing an
instance publicly.

| Account | Email | Default password |
|---|---|---|
| Citizen | `citizen@grievance.local` | `Citizen@2026!` |
| Global admin | `admin@grievance.local` | `Admin@2026!` |
| Superadmin | `superadmin@grievance.local` | `SuperAdmin@2026!` |
| Department manager | `<department>.manager@grievance.local` | `Manager@2026!` |
| Department employee | `<department>.employee@grievance.local` | `Resolver@2026!` |

Department account keys are `water`, `roads`, `transport`, `electricity`,
`sanitation`, `health`, `governance`, and `other`. Roads and transport share a
department in the user interface; their seeded accounts remain separate test
identities. `SEED_TEST_PASSWORD`, when configured, overrides manager and
employee defaults.

The current shared evaluation database snapshot (2026-10-23) contains 19
default demo accounts and 28 plausible civic complaints. These counts can
change as the demonstration proceeds. The demo seed command below adds up to
eight curated records; do not run it against the shared evaluation database
unless those extra records are wanted.

## Optional curated demo data

`backend/seed_demo_data.py` contains eight geolocated examples across water,
roads, transport, electricity, sanitation, health, governance, and other civic
services. Their image files are included in `frontend/public/demo-assets/`.

Run the seeder from the repository root against a disposable local MongoDB:

```bash
python -m backend.seed_demo_data
```

The command is idempotent for records it has already seeded. Do not use the
in-memory fallback with this separate command: its data disappears when the
seeder process exits. For a hosted frontend, set `DEMO_IMAGE_BASE_URL` to that
frontend's `/demo-assets` URL before seeding. Do not point the seeder at a
production or shared evaluation database unless adding these records is
intentional.

## Service configuration

Core workflows run without external AI services. Voice drafting runs on the
Gnani speech service and is enabled by configuration; everything else in this
table is optional per deployment. Configure backend values in `backend/.env`
or the hosting dashboard only when using the corresponding feature:

| Setting | Purpose | Default behavior |
|---|---|---|
| `GNANI_API_KEY`, `GNANI_PRISMA_ENABLED` | Gnani Prisma voice transcription for the voice-first intake | Voice drafting is unavailable until configured; the typed form works unchanged |
| `GNANI_API_KEY`, `GNANI_TIMBRE_ENABLED` | Gnani Timbre spoken output for speaker controls | Speaker controls are unavailable until configured; the same content stays available as text |
| `GROQ_API_KEY` | Optional classification and quality-check fallback | Local rules/classifier remain available without it |
| `HF_API_TOKEN` | Optional Hugging Face classification fallback | Not required for startup |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Backend Cloudinary account for signed URLs and asset deletion | Set on backend only; API secret must remain private |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Frontend direct image uploads | Must use the same cloud name; preset must be unsigned |
| `FACE_AUTH_ENABLED`, `FACE_EMBED_KEY` | Optional face sign-in | Disabled by default; also requires `backend/requirements-face.txt` and model setup |
| `SMS_PROVIDER` and `TWILIO_*` | SMS notifications | Dry-run/off unless configured |

Never put provider secrets in frontend `NEXT_PUBLIC_*` variables or commit them
to source control. See [backend/.env.example](backend/.env.example) and
[frontend/.env.example](frontend/.env.example) for additional settings.

## Tests and quality checks

From the repository root:

```bash
# Backend tests. MongoDB-specific tests skip unless TEST_MONGODB_URI is set.
python -m pytest

# Frontend lint and production build
npm --prefix frontend run lint
npm --prefix frontend run build

# Frontend voice unit and UI tests
npm --prefix frontend run test:voice

# Frontend/API contract checks
node frontend/scripts/check-contract.mjs
```

The backend test fixtures disable external API calls and use fresh in-memory
repositories. For MongoDB repository tests, set `TEST_MONGODB_URI` and
`TEST_MONGODB_DB` to a disposable test database. Do not point test fixtures at
the evaluation or production database.

`docs/USER_SIDE_TEST_CASES.md` is a manual test plan. Its cases are not a
record of executed tests; check the current status before treating the plan as
validation evidence.

## AI status and known limitations

- Voice intake transcription quality depends on the Gnani Prisma service; the
  platform has not independently evaluated transcription accuracy on real
  complaint audio.
- Category classification is an early-stage cascade using a local
  word/character model, deterministic rules, and optional provider fallbacks.
  It is experimental and must not be treated as validated accuracy.
- Priority and urgency values are advisory. A human reviews department routing
  and assigns employees.
- Related-complaint grouping uses client-side TF-IDF; semantic embedding search
  is not implemented.
- Several planned modules, including persisted summarization, entity
  extraction, delay-risk estimation, AI escalation recommendations, and
  resolution-quality assessment, are not complete.
- The application has not been approved or validated for real government
  operations or production-scale use.

## Deployment

The public deployment runs the Next.js frontend on Vercel and the FastAPI
backend on Render, with MongoDB Atlas:

| Component | Live URL |
|---|---|
| Frontend | https://civora-public-grievance.vercel.app |
| Backend API | https://grievance-ai-backend-04tv.onrender.com |
| API documentation | https://grievance-ai-backend-04tv.onrender.com/docs |

`render.yaml` defines the FastAPI backend service. Deploy the Next.js frontend
separately and set its `NEXT_PUBLIC_API_URL` to the deployed backend URL.

For any public deployment:

- Configure MongoDB (`MONGODB_URI`), a strong `JWT_SECRET_KEY`, exact
  `CORS_ORIGINS`, and `FRONTEND_URL` in the hosting provider's secret or
  environment settings.
- Set `TRUST_PROXY=true` on the backend, because the API runs behind the
  hosting reverse proxy.
- Keep `SEED_TEST_ACCOUNTS=false` and `NEXT_PUBLIC_SHOW_DEV_CREDS=false`;
  never expose the development credential panel publicly.
- Review the deployment-specific flags in `render.yaml`. Provider credentials
  (Gnani, Cloudinary, Twilio) must be configured in the hosting dashboard, not
  committed to the repository.

## Further documentation

- [Product requirements](PRD.md)
- [Project and research context](docs/PROJECT_CONTEXT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API contracts](docs/API.md)
- [Database design](docs/DATABASE.md)
- [Grievance workflows](docs/WORKFLOWS.md)
- [AI system and limitations](docs/AI_SYSTEM.md)
- [Security notes](docs/SECURITY.md)
- [Local development guide](docs/DEVELOPMENT.md)
- [Reusable UI design guide](docs/UI_DESIGN_GUIDE.md)
- [Voice-assisted complaint guide](docs/VOICE_ASSISTED_COMPLAINT.md)
