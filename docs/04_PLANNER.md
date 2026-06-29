# EdgeMind — Task Planner

## Rules for This Planner

1. Tasks are sequential. Task 2 does not start until Task 1 is VERIFIED working with real data.
2. Every task has a verification test. If test fails, task is not complete.
3. No mock data. No hardcoded responses. Everything must be real.
4. When a task completes, anti-gravity writes the result to REPORT.md immediately.
5. When all tasks in a phase complete, the full phase is tested end-to-end before moving to next phase.

---

## Phase 1 — Backend Foundation

---

### Task 1.1 — Project Setup

**What:** Create FastAPI project with folder structure, install dependencies, connect to Railway PostgreSQL.

**How:**
```
mkdir edgemind-backend
cd edgemind-backend
python -m venv venv
pip install fastapi uvicorn sqlalchemy asyncpg anthropic httpx celery python-dotenv python-jose[cryptography] passlib[bcrypt] boto3
```

Create `.env`:
```
DATABASE_URL=postgresql+asyncpg://...
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_ENDPOINT_URL=your_endpoint
JWT_SECRET_KEY=your_jwt_secret
ANTHROPIC_API_KEY=your_key
NVIDIA_API_KEY=your_key
HF_API_TOKEN=your_token
```

Create `main.py` with FastAPI app and one health check endpoint:
```
GET /health → returns {"status": "ok", "timestamp": "..."}
```

**Verification Test:**
Run `uvicorn main:app --reload`
Hit `GET /health` in browser or Postman.
Must return `{"status": "ok"}` with real timestamp.
Must NOT be hardcoded. Timestamp must change on each request.

---

### Task 1.2 — Database Tables

**What:** Create all 4 tables in Railway PostgreSQL using the schema in SPEC.md.

**How:**
Connect to Railway PostgreSQL using a SQL client (e.g., pgAdmin, psql, or DBeaver).
Run the CREATE TABLE statements from SPEC.md for:
- users
- devices
- models
- deployments

**Verification Test:**
In your SQL client, confirm all 4 tables exist.
Insert one test row into devices table manually.
Query it back via `SELECT * FROM devices`.
Must return the inserted row with auto-generated UUID and timestamp.
Delete the test row after verification.

---

### Task 1.3 — Auth Endpoints

**What:** Build POST /auth/register and POST /auth/login using custom JWT auth (python-jose).

**How:**
Use passlib for password hashing and python-jose for JWT:
```python
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# register
# Hash password and insert into users table in Railway PostgreSQL

# login
# Verify password hash and generate JWT using JWT_SECRET_KEY
```

**Verification Test:**
POST /auth/register with real email and password.
Must create user in your Railway PostgreSQL users table.
POST /auth/login with same credentials.
Must return a real JWT token (not mock).
Copy the JWT. Decode it at jwt.io. Must show real user ID and expiry.

---

### Task 1.4 — Device Registration Endpoint

**What:** Build POST /devices/register that saves device specs to database.

**How:**
Endpoint accepts the device spec payload from SPEC.md.
Requires JWT in Authorization header.
Extracts user_id from JWT.
Inserts row into devices table.
Returns device_id.

**Verification Test:**
Call POST /devices/register with real device data:
```json
{
  "name": "Test Phone",
  "phone_model": "Samsung Galaxy A12",
  "cpu_arch": "arm64-v8a",
  "ram_mb": 4096,
  "storage_free_gb": 22.5,
  "android_version": "11",
  "adb_serial": "R58M123FAKE"
}
```
Must return a real UUID.
Go to your SQL client. Must see the row with correct data in the devices table.
Call GET /devices. Must return that device in the list.

---

### Task 1.5 — HuggingFace Model Search

**What:** Build POST /models/search that calls real HuggingFace API and returns real model results.

**How:**
```python
import httpx

async def search_hf_models(task: str, max_size_mb: float, format: str):
    url = "https://huggingface.co/api/models"
    params = {
        "filter": [task, format],
        "sort": "downloads",
        "limit": 10,
        "full": True
    }
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=headers)
        return response.json()
```

Filter results to only return models where size fits device RAM.

**Verification Test:**
Call POST /models/search with:
```json
{
  "device_id": "your-device-uuid",
  "user_message": "I want to detect objects with my camera"
}
```
Must return real HuggingFace model data — real model names, real download counts, real file sizes.
Must NOT be hardcoded or mocked.
Verify by checking that returned model IDs actually exist on huggingface.co

---

### Task 1.6 — AI Assistant (Claude/NVIDIA)

**What:** Build POST /assistant/chat that calls real Claude API (primary) or NVIDIA NIM API (fallback) with device context.

**How:**
```python
import anthropic

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

def build_system_prompt(device, hf_results):
    return f"""
You are EdgeMind AI assistant. You help users deploy AI models to their Android devices.

Current device: {device.phone_model}
RAM: {device.ram_mb}MB
CPU: {device.cpu_arch}
Android: {device.android_version}

Available models from HuggingFace that fit this device:
{format_models(hf_results)}

Recommend the best 3 models for the user's request. Be specific. 
Mention expected performance on their exact device.
Keep response under 150 words.
"""

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1000,
    system=system_prompt,
    messages=[{"role": "user", "content": user_message}]
)
```

**Verification Test:**
Call POST /assistant/chat with message "I want real time object detection".
Must return a real Claude or NVIDIA response — not a template, not hardcoded.
Response must mention the actual device specs (Samsung Galaxy A12 or whatever was registered).
Response must reference real models found in Task 1.5 search.
Response must be different if you ask a different question.

---

## Phase 1 End-to-End Test

Before moving to Phase 2, run this full flow:

1. Register a new user account via POST /auth/register
2. Login and get JWT
3. Register a device via POST /devices/register with real (fake) specs
4. Call POST /models/search with "I want to detect objects" 
5. Verify real HuggingFace results come back
6. Call POST /assistant/chat with same message
7. Verify Claude/NVIDIA responds with real recommendations based on device specs

All 6 steps must pass. If any step fails, fix it before Phase 2.

---

## Phase 2 — Discovery Agent

---

### Task 2.1 — ADB Detection

**What:** Go binary that detects connected Android phone via ADB and reads specs.

**How:**
```go
package main

import (
    "os/exec"
    "strings"
)

func runADB(args ...string) string {
    cmd := exec.Command("adb", args...)
    out, _ := cmd.Output()
    return strings.TrimSpace(string(out))
}

func main() {
    serial := runADB("devices")  // get connected device serial
    model := runADB("-s", serial, "shell", "getprop", "ro.product.model")
    arch := runADB("-s", serial, "shell", "getprop", "ro.product.cpu.abi")
    // ... etc
}
```

**Verification Test:**
Plug in a real Android phone with USB debugging enabled.
Run the Go binary.
Must print real values: real phone model name, real CPU arch, real RAM amount.
Must NOT work if no phone is plugged in (should print "No device found").

---

### Task 2.2 — Agent Posts to Backend

**What:** Agent reads specs and sends them to POST /devices/register automatically.

**How:**
Agent reads JWT from a local config file (written by dashboard after login).
Agent calls POST /devices/register with real specs from ADB.
Prints device_id returned from backend.

**Verification Test:**
Run agent with phone plugged in.
Check Railway devices table.
Must see a new row with real phone specs — real model name, real RAM from the actual phone.
Must NOT create duplicate rows if run twice (check by adb_serial).

---

## Phase 2 End-to-End Test

1. Plug in real Android phone
2. Run discovery agent
3. Check Railway Postgres — real device with real specs must appear
4. Call GET /devices from backend — must return that device

---

## Phase 3 — Deployment

---

### Task 3.1 — Model Download from HuggingFace

**What:** Backend downloads a real model file from HuggingFace to a local temp folder on the server.

**How:**
```python
import tempfile
import hashlib

async def download_model_to_temp(hf_model_id: str, filename: str):
    url = f"https://huggingface.co/{hf_model_id}/resolve/main/{filename}"
    
    temp_dir = tempfile.mkdtemp(prefix="edgemind_")
    temp_path = os.path.join(temp_dir, filename)
    sha256 = hashlib.sha256()
    
    async with httpx.AsyncClient() as client:
        async with client.stream("GET", url, follow_redirects=True) as response:
            with open(temp_path, "wb") as f:
                async for chunk in response.aiter_bytes():
                    f.write(chunk)
                    sha256.update(chunk)
    
    return temp_path, sha256.hexdigest()
```

**Verification Test:**
Call the download function with a real small TFLite model from HuggingFace.
Check the local temp folder — file must be there.
File size must match what HuggingFace reports.
SHA256 must be calculable and non-empty.
Read the file back from disk. Must be a valid model file (not corrupt, size > 0).
Delete the temp file after verification.

---

### Task 3.2 — ADB Push to Phone

**What:** Backend pushes model file from local temp folder to phone via ADB.

**How:**
```python
import subprocess

def push_to_device(adb_serial: str, local_path: str, remote_path: str):
    result = subprocess.run(
        ["adb", "-s", adb_serial, "push", local_path, remote_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise Exception(f"ADB push failed: {result.stderr}")
    return True
```

**Verification Test:**
Push a real file to a real connected phone.
Run `adb shell ls /sdcard/edgemind/models/` on the phone.
File must appear in that directory.
File size on phone must match original file size.

---

### Task 3.3 — APK Installation via ADB

**What:** Backend checks if EdgeMind APK is installed on phone and installs it if not.

**How:**
```python
def check_apk_installed(adb_serial: str) -> bool:
    result = subprocess.run(
        ["adb", "-s", adb_serial, "shell", "pm", "list", "packages", "io.edgemind"],
        capture_output=True, text=True
    )
    return "io.edgemind" in result.stdout

def install_apk(adb_serial: str, apk_path: str):
    subprocess.run(
        ["adb", "-s", adb_serial, "install", "-r", apk_path],
        check=True
    )
```

**Verification Test:**
Uninstall EdgeMind APK from phone manually.
Run install function.
Check `adb shell pm list packages | grep edgemind` — must show package.
Run check function — must return True.

---

### Task 3.4 — Full Deployment Endpoint

**What:** POST /deployments triggers the full flow: download → push → install → update status.

**Verification Test:**
Create a deployment via POST /deployments with a real device_id and real HuggingFace model.
Poll GET /deployments/{id} every 3 seconds.
Status must go through: queued → downloading → pushing → complete.
At complete:
- Model file must be on phone (check via ADB)
- Config.json must be on phone (check via ADB)
- APK must be installed (check via ADB)
- Database record must show status "complete"

---

## Phase 3 End-to-End Test

1. Register device (Phase 2 verified)
2. Search models (Phase 1 verified)
3. Create deployment with real model
4. Watch status go to complete
5. Physically check phone — model file and APK must be present
6. Open EdgeMind app on phone — must load without error

---

## Phase 4 — Android App

---

### Task 4.1 — Flutter Project Setup

**What:** Create Flutter project, add dependencies for LiteRT, ONNX Runtime, llama.cpp FFI, camera, microphone.

**Verification Test:**
Run `flutter doctor` — must show no critical errors.
Run app on phone via USB (`flutter run`).
App must open on phone showing "No model deployed yet." message (since no config.json exists yet).
Must NOT crash.

---

### Task 4.2 — Config Reader

**What:** App reads /sdcard/edgemind/config.json on startup and knows what mode to show.

**Verification Test:**
Manually push a config.json to phone via ADB with `inference_mode: "camera"`.
Run app.
App must show camera mode UI — not chat, not voice, not "no model" screen.
Change config to `inference_mode: "chat"`.
Restart app.
Must show chat UI.

---

### Task 4.3 — Camera Mode (TFLite)

**What:** App opens camera, loads TFLite model, runs inference on frames, shows results on screen.

**Verification Test:**
Push a real TFLite object detection model to phone via ADB.
Push matching config.json.
Open app.
Point camera at objects.
Must show bounding boxes OR labels on screen in real time.
Must work with NO internet connection (turn off WiFi and mobile data first).
FPS must be visible and above 5fps.

---

### Task 4.4 — Chat Mode (GGUF)

**What:** App shows chat interface, loads GGUF model via llama.cpp FFI, generates responses locally.

**Verification Test:**
Push a real small GGUF model (e.g., Phi-3 mini Q4) to phone via ADB.
Push matching config.json with `inference_mode: "chat"`.
Open app.
Type "Hello, what can you do?"
Must receive a real generated response — not a hardcoded string.
Turn off ALL internet on phone.
Ask another question.
Must still work and generate a response.

---

### Task 4.5 — Voice Mode (TFLite Audio)

**What:** App records audio, runs audio classification or transcription model, shows result.

**Verification Test:**
Push a real audio TFLite model to phone.
Push matching config with `inference_mode: "voice"`.
Open app.
Tap mic button, say something.
Must show a real text result — transcription or classification.
Must work offline.

---

## Phase 4 End-to-End Test

Full flow on real hardware, USB unplugged:

1. Phone is disconnected from laptop
2. WiFi OFF on phone. Mobile data OFF.
3. Open EdgeMind app
4. For camera model: point at objects → see detections
5. For chat model: type message → get real response
6. For voice model: speak → see text result
7. None of these must require any network calls

All 7 checks must pass.

---

## Phase 5 — Dashboard Integration

---

### Task 5.1 — Connect Dashboard to Backend

**What:** Next.js dashboard calls real backend endpoints — not mock data.

**Verification Test:**
Open dashboard.
Login with real account.
Fleet page must show real devices from database.
Must NOT show any hardcoded device names or fake data.
If no devices: must show empty state message.

---

### Task 5.2 — Real AI Chat in Dashboard

**What:** AI assistant panel in dashboard sends messages to POST /assistant/chat and shows real Claude/NVIDIA responses.

**Verification Test:**
Type "I want to detect people with my camera" in assistant panel.
Must show real Claude/NVIDIA response with real model recommendations.
Response must mention the actual registered device specs.
Must NOT be a hardcoded template.

---

### Task 5.3 — Deploy from Dashboard

**What:** Clicking deploy in dashboard triggers real deployment to real phone.

**Verification Test:**
Select a model in dashboard.
Click deploy.
Progress must update in real time (poll every 3 seconds).
Phone must receive the model file (verify via ADB during deployment).
Deployment status must reach "complete" in dashboard.
Open EdgeMind app on phone — must load the deployed model.

---

## Final System Test

This is run once after all phases complete. If any step fails, go back and fix before calling the product done.

1. Fresh user registers
2. Plugs in Android phone
3. Runs discovery agent
4. Phone appears in dashboard with correct real specs
5. Types "I want to detect cars in my parking lot" in AI chat
6. Receives real Claude/NVIDIA response with real HuggingFace model recommendations
7. Picks a model and clicks deploy
8. Watches real-time progress in dashboard
9. Deployment reaches complete
10. Unplugs phone
11. Opens EdgeMind app
12. Points camera at a car (or any vehicle)
13. Must see real-time detection with bounding boxes
14. Turns off WiFi on phone — must still work

All 14 steps must pass for the product to be considered Phase 1 complete.
