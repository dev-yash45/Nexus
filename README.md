# Nexus — Universal Multimodal Emergency & Civic Bridge

Nexus is an elite, multimodal emergency and civic action command web application engineered for high-stress situations. It provides real-time browser sensor integration, live speech transcription, AI optical document triage, and automated first responder dispatch telemetry.

---

## 🚨 Core Zones & Capabilities

1. **Civic Action (The Yellow Zone — Primary Hub)**
   - **Live Viewfinder & Camera Integration**: Streams device rear camera (`environment`) with HUD corner brackets and scanning laser overlay.
   - **2-Step Review Workflow**: Freeze and review captured hazard frames before committing to AI analysis.
   - **Automated Municipal Docketing**: Generates classified work orders with depth/cavity dimensions, reverse geocoding, and ward telemetry.

2. **Med-Scanner AI (The Blue Zone)**
   - **Optical Triage & Formulary Verification**: Scans handwritten doctor prescriptions, hospital discharge summaries, and lab records.
   - **Critical Allergy Detection**: Prominently highlights life-threatening drug contraindications (e.g. Beta-Lactam / Penicillin anaphylaxis).
   - **Live Camera Scanning or PDF/Image Upload**: Dual-mode input with document preview staging.

3. **Scam Shield Sentinel (The Green Zone)**
   - **Zero-Day Phishing & Fraud Inspection**: Forensic analysis of suspicious text messages, phishing links, and deceptive APK links.
   - **Government Document & Seal Verification**: Deep audits of fake traffic e-challans, police arrest warrants, court notices, and forged sovereign emblems.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Pure Vanilla JavaScript (ES6+), HTML5 Web APIs (`getUserMedia`, `Geolocation`), and Vanilla CSS3 Glassmorphism.
- **Backend**: Vercel Serverless Function (`/api/nexus-engine.js`) integrating Google Gemini 1.5 Flash via `@google/generative-ai`.
- **Audio Engine**: Procedural Web Audio API sound synthesizer (zero external mp3 assets).
- **Responsive**: Mobile-first adaptive layout with desktop two-column command center and sticky mobile glass dock.

---

## 🔒 Security & Environment Setup

The application strictly protects API keys by routing requests through a serverless backend. The API key is **never** exposed to the client-side browser or committed to version control.

### 1. Clone the repository
```bash
git clone https://github.com/dev-yash45/Nexus.git
cd Nexus
```

### 2. Configure Environment Variable
Create a local `.env` file in the root directory (this file is ignored by `.gitignore` and will never be committed):
```bash
cp .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey))*

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
You can run using Vercel CLI for full local serverless function support:
```bash
npx vercel dev
```
Or view the static frontend using any local HTTP server:
```bash
npx serve .
```

---

## 🚀 Deployment (Vercel)

1. Import the repository into your [Vercel Dashboard](https://vercel.com).
2. Go to **Project Settings** > **Environment Variables**.
3. Add `GEMINI_API_KEY` with your Google Gemini API key value.
4. Deploy! The serverless API route `/api/nexus-engine` will automatically handle requests.
