# EdgeMind — User Journey

## The Complete Flow (Production)

---

### Step 1: User Opens Dashboard

User goes to EdgeMind web app in their browser on their laptop.
Logs in with email and password.
Sees empty fleet view — no devices yet.

---

### Step 2: User Plugs In Phone

User plugs Android phone into laptop via USB cable.
Phone shows prompt: "Allow USB debugging?" — user taps Allow.
User clicks "Connect Device" button on dashboard.

Dashboard triggers the discovery agent (Go binary running locally).
Discovery agent runs ADB commands:
- `adb devices` — confirms phone is connected
- `adb shell getprop ro.product.model` — gets phone model name
- `adb shell cat /proc/meminfo` — gets RAM
- `adb shell df /data` — gets storage
- `adb shell getprop ro.product.cpu.abi` — gets CPU architecture
- `adb shell getprop ro.build.version.release` — gets Android version

All specs sent to backend. Phone appears in dashboard:

```
Samsung Galaxy A12
Android 11 · ARM64 · 4GB RAM · 22GB free storage
Status: Connected
```

---

### Step 3: User Tells AI What They Want

AI assistant panel is open on the right side of dashboard.

AI says: "I see your Samsung Galaxy A12 — 4GB RAM, ARM64. What do you want it to do?"

User types anything. Examples:
- "I want to detect objects with my camera in real time"
- "I want a chatbot that works offline"
- "I want to transcribe my voice to text"
- "I want to detect if someone is in a restricted area"

AI reads the message. AI reads the device specs from the database.
Backend calls HuggingFace API with filters:
- Task type derived from user message
- Max model size based on device RAM (safe limit: RAM × 0.4)
- Format: tflite OR onnx OR gguf
- Sorted by downloads (most popular first)

Backend calls Claude API (or NVIDIA API fallback) with:
- User's message
- Device specs
- Top 5 HuggingFace search results

The AI returns a conversational response with 3 recommendations ranked by fit.

Example AI response:
"For real-time object detection on your A12, here are 3 options that fit your 4GB RAM:

1. MobileNetV4-TFLite — 45MB, 20fps on your device, detects 1000 object types
2. YOLOv8n-TFLite — 27MB, faster but slightly less accurate
3. EfficientDet-Lite0 — 55MB, most accurate of the three

Which one? Or tell me more about what you want to detect."

---

### Step 4: User Picks a Model

User says "go with option 1" or clicks the model card.

Dashboard shows: "Deploying MobileNetV4 to your Samsung Galaxy A12..."

---

### Step 5: Deployment

Backend does this in sequence:

1. Downloads model from HuggingFace to a local temp folder on the server
2. Verifies SHA256 hash
3. Pushes model file from temp folder to phone via ADB:
   `adb push model.tflite /sdcard/edgemind/models/`
4. Checks if EdgeMind APK is installed on phone:
   `adb shell pm list packages | grep edgemind`
5. If not installed: `adb install edgemind.apk`
6. Writes deployment config to phone:
   `adb push config.json /sdcard/edgemind/config.json`
7. Updates deployment record in database to "complete"

Dashboard shows: "Done. Model is on your phone."

Total time: 1-3 minutes depending on model size and USB speed.

---

### Step 6: User Unplugs Phone

USB cable removed. Laptop not needed anymore.

---

### Step 7: User Interacts With Model on Phone

User opens EdgeMind app on their phone.

App reads config.json to know which model is deployed and what type it is.
App loads model file into the correct runtime.
App shows the correct UI based on model type:

**If object detection / image classification:**
Camera opens automatically. Model runs on every frame. Bounding boxes or labels appear on screen in real time. User just points the camera.

**If text/chat model (GGUF):**
Chat screen opens. User types a message. Model generates response locally. No internet. Response appears in seconds.

**If voice/audio model:**
Microphone activates. User speaks. Model processes audio. Text result appears on screen.

Everything runs offline. No internet connection needed. No laptop needed. No USB needed.

---

### Step 8: Deploying a New Model Later

User wants to try a different model or task.
They plug phone back into laptop via USB.
Go back to dashboard. Pick new model. Deploy.
Old model replaced. Unplug. Use new model.
