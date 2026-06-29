# EdgeMind — Production Spec

## Backend API Endpoints

### Auth
```
POST /auth/register    body: {email, password}
POST /auth/login       body: {email, password} → returns JWT
```

### Devices
```
POST /devices/register
body: {
  name: string,
  model: string,        // "Samsung Galaxy A12"
  cpu_arch: string,     // "arm64-v8a"
  ram_mb: integer,      // 4096
  storage_free_gb: float,
  android_version: string,
  adb_serial: string    // unique ADB device ID
}
returns: { device_id: uuid }

GET /devices
returns: [ list of user's devices with status ]

GET /devices/{id}
returns: full device record + current deployment
```

### Models
```
POST /models/search
body: {
  device_id: uuid,
  user_message: string   // plain language request
}
returns: {
  ai_response: string,   // Claude/NVIDIA explanation
  recommendations: [
    {
      hf_model_id: string,
      name: string,
      size_mb: float,
      format: string,
      task: string,
      download_url: string,
      estimated_fps: integer   // calculated from device specs
    }
  ]
}

POST /models/upload
body: multipart form — model file + metadata
returns: { model_id: uuid, sha256: string }
```

### Deployments
```
POST /deployments
body: {
  device_id: uuid,
  model_source: "huggingface" | "upload",
  hf_model_id: string,    // if huggingface
  model_id: uuid,         // if upload
  config: {
    inference_mode: "camera" | "chat" | "voice",
    confidence_threshold: float
  }
}
returns: { deployment_id: uuid, status: "queued" }

GET /deployments/{id}
returns: { status, progress_percent, error_message }

POST /deployments/{id}/rollback
returns: { status: "rolling_back" }
```

### Assistant
```
POST /assistant/chat
body: {
  message: string,
  device_id: uuid,
  conversation_history: [ {role, content} ]
}
returns: {
  response: string,
  action: null | "search_models" | "deploy",
  search_results: [ ... ]   // if action is search_models
}
```

---

## Database Tables (PostgreSQL - Railway)

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) NOT NULL,
  name            TEXT NOT NULL,
  phone_model     TEXT,
  cpu_arch        TEXT,
  ram_mb          INTEGER,
  storage_free_gb FLOAT,
  android_version TEXT,
  adb_serial      TEXT UNIQUE,
  status          TEXT DEFAULT 'offline',
  last_seen       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE models (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) NOT NULL,
  name         TEXT NOT NULL,
  hf_model_id  TEXT,
  source       TEXT NOT NULL,   -- 'huggingface' | 'upload'
  format       TEXT NOT NULL,   -- 'tflite' | 'onnx' | 'gguf'
  size_mb      FLOAT,
  task_type    TEXT,
  file_url     TEXT,
  sha256       TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deployments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  device_id     UUID REFERENCES devices(id),
  model_id      UUID REFERENCES models(id),
  status        TEXT DEFAULT 'queued',
  config        JSONB,
  deployed_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  error_message TEXT
);
```

---

## Discovery Agent Spec (Go binary)

File: `edgemind-agent` — single binary, ~3MB

Runs on: macOS, Windows, Linux (all amd64)

What it does when triggered:
```
1. Run: adb devices
   → Confirm phone connected
   → Get ADB serial number

2. Run: adb shell getprop ro.product.model
   → Get phone model name

3. Run: adb shell getprop ro.product.cpu.abi
   → Get CPU architecture

4. Run: adb shell cat /proc/meminfo | grep MemTotal
   → Get total RAM in KB, convert to MB

5. Run: adb shell df /data | tail -1
   → Get free storage in KB, convert to GB

6. Run: adb shell getprop ro.build.version.release
   → Get Android version

7. POST all data to /devices/register with user's JWT

8. Exit
```

The agent is a one-shot binary. It runs, does its job, exits.
It is NOT a daemon. It is NOT always running.
Dashboard calls it when user clicks "Connect Device".

---

## Android App Spec (Flutter)

### On App Open
1. Read `/sdcard/edgemind/config.json`
2. If no config: show "No model deployed yet. Connect to laptop to deploy."
3. If config exists: load model file from `/sdcard/edgemind/models/{model_name}`
4. Show loading screen while model initializes
5. Show correct UI based on `inference_mode` in config

### Camera Mode (tflite object detection)
- Open front or back camera (user can toggle)
- Run model on each frame using LiteRT
- Draw bounding boxes or labels on screen overlay
- Show confidence score per detection
- No internet required

### Chat Mode (gguf text generation)
- Show chat interface
- User types message in text input
- Send to llama.cpp (via FFI in Flutter)
- Stream response tokens to screen
- Show conversation history
- No internet required

### Voice Mode (tflite audio classification or transcription)
- Show microphone button
- Record audio on tap-and-hold
- Run model on audio buffer
- Show result text on screen
- No internet required

### Config JSON format
```json
{
  "model_name": "mobilenetv4.tflite",
  "model_path": "/sdcard/edgemind/models/mobilenetv4.tflite",
  "inference_mode": "camera",
  "format": "tflite",
  "confidence_threshold": 0.75,
  "deployed_at": "2025-06-15T10:00:00Z",
  "deployment_id": "uuid-here"
}
```

---

## HuggingFace Model Search Logic

When user sends a message, backend does this:

```python
# 1. Classify the task from user message
task_map = {
  "detect": "object-detection",
  "camera": "object-detection",
  "chat": "text-generation",
  "talk": "text-generation",
  "voice": "automatic-speech-recognition",
  "transcribe": "automatic-speech-recognition",
  "classify": "image-classification",
  "recognize": "image-classification"
}

# 2. Calculate max model size
max_size_mb = device.ram_mb * 0.4
# 4GB RAM → max 1.6GB model

# 3. Call HuggingFace API
GET https://huggingface.co/api/models
  ?filter={task}
  &filter=tflite  (or onnx, or gguf)
  &sort=downloads
  &limit=10

# 4. Filter by size
models_that_fit = [m for m in results if m.size_mb <= max_size_mb]

# 5. Send top 5 to Claude with device specs
# Claude (or NVIDIA) picks best 3 and explains in plain language
```

---

## Deployment Flow Detail

```
POST /deployments triggered
    ↓
Background task starts
    ↓
1. Download model from HuggingFace URL
   → Stream to local temp folder on the server
   → Calculate SHA256 during download
    ↓
2. Generate config.json for this deployment
    ↓
3. ADB commands (via subprocess in Python):
   adb -s {serial} push {temp_model_file} /sdcard/edgemind/models/
   adb -s {serial} push config.json /sdcard/edgemind/config.json
    ↓
4. Delete temp model file from server after successful push
    ↓
5. Check if APK installed:
   adb -s {serial} shell pm list packages | grep io.edgemind
    ↓
6. If not installed:
   adb -s {serial} install -r edgemind.apk
    ↓
7. Update deployment status to "complete" in database
    ↓
Dashboard polls GET /deployments/{id} every 3 seconds
Shows real-time progress to user
```

---

## Error Handling

| Error | What happens |
|-------|-------------|
| Phone not detected by ADB | Dashboard shows "Phone not found. Check USB debugging is enabled." |
| Model too large for device | AI warns user before deploy. Suggests smaller alternative. |
| Download fails mid-way | Celery retries 3 times. If all fail: status = "failed", user notified. |
| APK install rejected by phone | Show: "Allow installation from unknown sources in phone settings." |
| Model fails to load on phone | App shows error. User must re-deploy from dashboard. |

---

## What Is NOT Built in Phase 1

- No federated learning
- No OTA updates over WiFi
- No multiple devices simultaneously
- No Play Store
- No analytics or metrics
- No alerts or notifications
- No model training
- No fine-tuning
