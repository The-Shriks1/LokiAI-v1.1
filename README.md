<div align="center">
  <img src="lokiai-wordmark-new.png" alt="LokiAI Logo" width="400" />
  <p><strong>Secure Edge Intelligence — Deploy Hugging Face models directly to local devices.</strong></p>
  <p>
    <a href="https://lokiai.theshriks.space">Live Site: lokiai.theshriks.space</a>
  </p>
</div>

---

# LokiAI

LokiAI transforms ordinary hardware into purpose-built AI systems through a direct, high-performance deployment process. It allows you to deploy fully local neural networks from Hugging Face directly onto your mobile hardware. 

Enjoy zero cloud latency, 100% offline autonomy, and complete data privacy by running models directly on the edge.

## Key Features

- **Direct Deployment**: Move model weights directly from Hugging Face to local edge hardware.
- **Hardware Profiling**: Automatic hardware discovery to check device specs (RAM, GPU capabilities) and match compatible models.
- **Zero Cloud Latency**: 100% offline intelligence running directly on your edge nodes.
- **AI-Powered Recommendation Assistant**: Explain your target task in natural language, and LokiAI queries Hugging Face to find and verify the optimal models that fit your device's memory boundaries.

## Architecture Overview

1. **Web Dashboard**: View paired devices, query compatible models, and manage deployment status.
2. **Discovery Agent**: Automatically profiles connected devices over ADB/USB.
3. **Backend Agent**: Coordinates Hugging Face API queries, handles model validation, and facilitates pushing model binaries directly to devices.
4. **Edge Runtime**: Runs models locally and offline with text, voice, or camera-based inference.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Gemini API key (for powering the natural language model selection assistant)

### Run Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd lokiai-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` (or `.env`):
   ```bash
   cp .env.example .env.local
   ```
   Open the file and update `GEMINI_API_KEY` with your actual API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open the local server URL (usually `http://localhost:4556`) to access the dashboard.

---

For the live platform, visit [lokiai.theshriks.space](https://lokiai.theshriks.space).
