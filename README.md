# ⚡ Nexus — Universal Multimodal Emergency & Civic Command Bridge

[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3 Glassmorphism](https://img.shields.io/badge/CSS3-Modern_Glassmorphism-1572B6?logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?logo=google&logoColor=white)](https://aistudio.google.com/)
[![Web APIs](https://img.shields.io/badge/Web_APIs-Camera_%26_GPS-00599C)](https://developer.mozilla.org/en-US/docs/Web/API)
[![Vercel Ready](https://img.shields.io/badge/Deployment-Vercel_Serverless-000000?logo=vercel&logoColor=white)](https://vercel.com)

**Nexus** is an elite, multimodal emergency response and civic intelligence web application engineered for rapid action in high-stress situations. Built with **zero external frontend UI frameworks**, it leverages pure Vanilla JavaScript, modern CSS3 glassmorphism, native HTML5 Web APIs (Camera stream, high-accuracy GPS, Web Audio synthesis), and a secure serverless Google Gemini 1.5 multimodal AI backend.

---

## 🏛️ System Architecture

Nexus is organized into three mission-critical operational zones, orchestrated by a central reactive navigation engine:

```
                                ┌───────────────────────────────────────────────┐
                                │          NEXUS COMMAND CENTER                 │
                                │   Live UTC Clock • Audio Synth • Quick 112    │
                                └──────────────────────┬────────────────────────┘
                                                       │
                 ┌─────────────────────────────────────┼─────────────────────────────────────┐
                 │                                     │                                     │
                 ▼                                     ▼                                     ▼
     ┌───────────────────────┐             ┌───────────────────────┐             ┌───────────────────────┐
     │   🚧 CIVIC ACTION     │             │    💊 MED-SCANNER     │             │   🛡️ SCAM SHIELD      │
     │   (The Yellow Zone)   │             │   (The Blue Zone)     │             │   (The Green Zone)    │
     ├───────────────────────┤             ├───────────────────────┤             ├───────────────────────┤
     │ • Photo & Upload      │             │ • Prescription OCR    │             │ • Phishing & SMS      │
     │ • HUD Laser Reticle   │             │ • Drug Allergies      │             │ • Fake Police Notice  │
     │ • 2-Step Review Stage │             │ • Dosage Schedules    │             │ • Digital Arrest Scam │
     │ • Municipal Workorder │             │ • Bio-Pass Generation │             │ • Cyber Crime Portal  │
     └───────────────────────┘             └───────────────────────┘             └───────────────────────┘
```

---

## 🚨 Core Zones & Capabilities

### 1. 🚧 Civic Action (The Yellow Zone — Primary Hub)
Engineered for rapid public hazard detection, depth profiling, and municipal accountability.
- **Multimodal Viewfinder**: Live device rear-camera streaming (`facingMode: "environment"`) with animated holographic corner brackets, center reticle, and sweeping scanner laser overlay.
- **Capture Modes**:
  - **Photo**: Instant camera frame freeze via off-screen HTML5 canvas conversion.
  - **Upload**: Direct image upload (`.jpg`, `.png`, `.webp`) for previously captured field photos.
- **2-Step Review & Confirm Workflow**:
  - Freezes telemetry, locks GPS coordinates (accuracy ±1.2m), and presents a **Captured Media Review** stage before committing data to AI analysis.
  - **Smart Retake Action**: Completely clears previous uploads/captures, purges memory frames, resets file inputs, and re-activates the live viewfinder seamlessly.
- **Automated Municipal Docketing**:
  - Extracted hazard geometry (e.g. 42cm asphalt cavity depth).
  - Reverse geocoding to sovereign jurisdictions (e.g. PCMC Ward 14, MG Road Corridor).
  - 24-hour target resolution SLA and public blockchain verification tag.

---

### 2. 💊 Med-Scanner AI (The Blue Zone — Optical Bio-Triage)
Designed for emergency pharmacological triage and deciphering messy medical records.
- **Dual-Input Scanning**:
  - **Live Optical Camera**: Real-time high-contrast document viewfinder with corner alignment brackets.
  - **Digital File Ingestion**: Supports scans and PDF records (`.jpg`, `.png`, `.pdf`) with pre-loaded clinical presets (OPD Dr. Rao prescription, Inpatient discharge summaries).
- **Clinical Optical Character Recognition (OCR)**:
  - Extracts doctor's handwriting, active pharmaceutical ingredients, daily dosages, and schedule instructions.
  - Maps diagnoses to standard ICD-10 medical classifications (e.g. Type 2 Diabetes, Essential Hypertension).
- **Critical Allergy Countermeasures**:
  - Highlights severe drug contraindications in bold red banners (e.g. Beta-Lactam / Penicillin anaphylaxis).
  - Formulates an encrypted Emergency Bio-Pass with emergency responder quick-dial (`112`).

---

### 3. 🛡️ Scam Shield Sentinel (The Green Zone — Cyber Crime Forensics)
Rapid forensic analysis of extortion threats, fake legal documents, and digital phishing attempts.
- **Multi-Vector Audit**:
  - **Text & SMS Inspection**: Paste suspicious WhatsApp messages, fake parcel delivery alerts, lottery winnings, or APK download links.
  - **Document Inspection**: Upload screenshots of fake police arrest warrants, forged Supreme Court legal summons, and bogus traffic e-challans.
- **Sovereign Legal Fact-Checking**:
  - Explains actual legal statutes (e.g. Indian Law, Supreme Court, and State Police **never** conduct "Digital Arrests" via video calls).
  - Flags spoofed domains, fraudulent bank accounts, and APK malware signatures.
- **Immediate Escalation**:
  - Direct links to report incidents to the official **National Cyber Crime Reporting Portal** ([cybercrime.gov.in](https://cybercrime.gov.in)) or call **1930**.

---

## ⚡ Native Hardware & Browser APIs

Nexus interacts directly with native device hardware using standard HTML5 APIs:

| Feature | Browser API | Implementation Detail |
|---|---|---|
| **High-Accuracy GPS** | `navigator.geolocation` | `enableHighAccuracy: true`, 10s timeout, fallback coordinate bridge |
| **Camera Viewfinder** | `navigator.mediaDevices.getUserMedia` | Ideal 1280x720 video with rear `environment` facing mode constraint |
| **Video Frame Grab** | HTML5 Canvas 2D | Captures instant high-res JPEG Data URLs (`image/jpeg`) without freezing DOM |
| **Sound Synthesizer** | Web Audio API (`AudioContext`) | Real-time procedural oscillators (shutter, clicks, alert chirps, chimes) |

---

## ⌨️ Keyboard Shortcuts & Quick Navigation

Navigate across zones instantly with single-key shortcuts:
- <kbd>1</kbd> — Switch to **Civic Action** (Yellow Zone)
- <kbd>2</kbd> — Switch to **Med-Scanner AI** (Blue Zone)
- <kbd>3</kbd> — Switch to **Scam Shield Sentinel** (Green Zone)
- **Emergency Speed Dial**: Tap the red emergency badge or call **112** directly from any screen.

---

## 🔒 Security & Environment Architecture

To protect API credentials from theft or abuse, Nexus uses a **Serverless API Bridge**:
- The client-side browser **never** contains or exposes the Google Gemini API key.
- All multimodal analysis requests are dispatched to `/api/nexus-engine`.
- The serverless backend securely reads `process.env.GEMINI_API_KEY` to authenticate with Google's Generative AI servers.
- Local `.env` files are strictly ignored by `.gitignore`.

---

## 🛠️ Local Development & Setup

### 1. Clone the repository
```bash
git clone https://github.com/dev-yash45/Nexus.git
cd Nexus
```

### 2. Configure Environment Variable
Create a local `.env` file from the provided example:
```bash
cp .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> *(Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey))*

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally

**Option A: Full Serverless Support (Recommended)**
```bash
npx vercel dev
```
Runs the frontend and the `/api/nexus-engine` serverless backend locally.

**Option B: Frontend Only**
```bash
npx serve .
# or
python3 -m http.server 8080
```

---

## 🚀 Deployment (Vercel)

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Import the project in your [Vercel Dashboard](https://vercel.com).
3. Navigate to **Project Settings** > **Environment Variables**.
4. Add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API Key
5. Click **Deploy**. Vercel will automatically configure static assets and the serverless API function defined in [vercel.json](file:///Users/yash/Desktop/prompt/Nexus/vercel.json).

---

## 📂 Repository File Structure

```
Nexus/
├── index.html              # Main application shell (3-zone desktop & mobile layout)
├── css/
│   ├── main.css            # Design tokens, typography, glassmorphism & reset
│   ├── zones.css           # Zone layouts, camera HUD, preview cards & review stages
│   └── components.css     # Buttons, badges, toasts, modal overlays & pills
├── js/
│   ├── app.js              # Application coordinator, hotkeys, theme sync & navigation
│   ├── zones.js            # Civic Action, Med-Scanner & Scam Shield feature logic
│   ├── hardware.js         # Camera stream, video frame capture & Geolocation (GPS)
│   └── audio.js            # Procedural Web Audio API sound synthesizer
├── api/
│   └── nexus-engine.js     # Serverless Google Gemini 1.5 Flash multimodal AI engine
├── .env.example            # Template for environment configuration
├── .gitignore              # Ignores .env, node_modules, and cache files
├── package.json            # Node.js dependencies and scripts
├── vercel.json             # Vercel serverless function routing rules
└── README.md               # Complete project documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Built for high-efficiency emergency and civic assistance.
