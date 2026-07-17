# EdgeMind — Production Architecture

## What We Are Building

A platform where:
1. User plugs Android phone into laptop via USB
2. Dashboard auto-reads phone specs
3. User tells AI what they want in plain language
4. AI finds real models from Hugging Face that fit the device
5. Model downloads to phone
6. User unplugs. Opens EdgeMind Android app. Interacts offline.

No mock data. No simulation. Everything real.

---

## System Components

### 1. Web Dashboard (Next.js)
- Runs in browser on user's laptop
- Shows connected devices, model search, deployment status
- AI assistant panel for natural language model selection

### 2. Discovery Agent (Go binary, runs on laptop)
- Activated when user clicks "Connect Device" on dashboard
- Uses ADB to read phone specs via USB
- Sends specs to backend
- One-time job per device registration

### 3. Backend (FastAPI + Python)
- Receives device specs from discovery agent
- Calls Hugging Face API to search models by task + hardware constraints
- Calls Claude API (or NVIDIA NIM API) to power the AI assistant
- Manages deployment records in PostgreSQL
- Triggers model push to phone via ADB

### 4. Android App (Flutter)
- Single APK — no Play Store
- Installed via ADB (USB)
- Two modes depending on deployed model:
  - Camera mode: live inference on camera feed
  - Chat mode: text input/output
  - Voice mode: microphone input, text output
- Loads model on app open, runs fully offline

### 5. Database (PostgreSQL via Railway)
- users table
- devices table
- models table
- deployments table
- inference_logs table

### 6. Model Storage (Future: Cloudflare R2 Storage)
- NOT used for HuggingFace model downloads — those go directly to a local temp folder on the server
- Will be used in the future only for custom user-uploaded models

---

## Data Flow

```
USB plug-in
    → Discovery Agent reads specs via ADB
    → POST /devices/register → PostgreSQL

User describes task in AI chat
    → POST /assistant/chat
    → Backend calls HuggingFace Search API
    → Backend calls Claude API (or NVIDIA API) with device specs + search results
    → Returns 3 model recommendations

User picks model → clicks Deploy
    → POST /deployments
    → Backend downloads model from HuggingFace to local temp folder
    → ADB pushes model file from temp folder to phone storage
    → Temp file deleted after successful push
    → ADB installs EdgeMind APK if not present
    → Deployment status updated to "complete"

User unplugs USB
    → Opens EdgeMind app on phone
    → App loads model from local storage
    → User interacts — camera / chat / voice
    → 100% offline from this point
```

---

## Tech Stack — Final Decisions

| Component | Technology | Reason |
|-----------|-----------|--------|
| Dashboard | Next.js 14 | Fast, React-based |
| Discovery Agent | Go 1.22 | Small binary, ADB support |
| Backend | FastAPI Python 3.12 | Fast API dev, hosted on Railway free tier |
| Database | PostgreSQL (Railway) | Real managed Postgres database |
| File Storage | Local temp folder (R2 future for custom uploads) | No cloud hop needed for HF downloads |
| Auth | Custom JWT (python-jose) | We own auth, no vendor lock-in |
| Android App | Flutter | Single codebase, camera/mic/chat built in |
| Model search | Hugging Face API | Free, largest model hub |
| AI Assistant | Claude API (primary) & NVIDIA NIM API (fallback) | Natural language understanding |
| ADB tool | Android Debug Bridge | USB device communication |

---

## Inference Runtimes on Android (inside Flutter app)

| Model format | Runtime used | Notes |
|-------------|-------------|-------|
| .tflite | LiteRT (TFLite) | Best for Android, hardware accelerated |
| .onnx | ONNX Runtime Android | Broad model support |
| .gguf | llama.cpp (via FFI) | For LLM/chat models |

App auto-detects format and loads correct runtime.

---

## What Runs Where

```
LAPTOP:
- Web dashboard (browser)
- Discovery agent (background process during USB connection)
- ADB (system tool, pre-installed or bundled)

BACKEND SERVER:
- FastAPI (Railway)
- PostgreSQL (Railway)
- Local temp folder for model downloads
- Claude API and NVIDIA API calls
- HuggingFace API calls

ANDROID PHONE (after deployment):
- EdgeMind APK
- Model file (in app storage)
- Inference runtime (inside APK)
- Everything offline
```

---

## Constraints

- No Play Store — APK installed via ADB only
- No cloud inference after deployment — 100% on device
- No pre-selected models — HuggingFace is the model source
- User describes task in natural language — AI picks models
- USB required only for initial setup and deployment
- Phone runs independently after USB unplugged
