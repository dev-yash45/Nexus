# ⚡ Nexus — Universal Multimodal Emergency & Civic Command Bridge

[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3 Glassmorphism](https://img.shields.io/badge/CSS3-Modern_Glassmorphism-1572B6?logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?logo=google&logoColor=white)](https://aistudio.google.com/)
[![Web APIs](https://img.shields.io/badge/Web_APIs-Camera_%26_GPS-00599C)](https://developer.mozilla.org/en-US/docs/Web/API)
[![Tests Passing](https://img.shields.io/badge/Tests-36%20Passed-10b981?logo=node.js&logoColor=white)](https://github.com/dev-yash45/Nexus)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-38bdf8)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Vercel Ready](https://img.shields.io/badge/Deployment-Vercel_Serverless-000000?logo=vercel&logoColor=white)](https://nexus-yash-42de.vercel.app/)

**Nexus** is an elite, multimodal emergency response and civic intelligence web application engineered for rapid action in high-stress situations. Built with **zero external frontend UI frameworks**, it leverages pure Vanilla JavaScript, modern CSS3 glassmorphism, native HTML5 Web APIs (Camera stream, high-accuracy GPS, Web Audio synthesis), an isomorphic validation & priority engine, and a secure serverless Google Gemini 1.5 multimodal AI backend.

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
     │ • Priority Scoring    │             │ • Bio-Pass Generation │             │ • 1930 Cyber Cell Ref │
     │ • JSON / CSV Export   │             │ • Formulary Warnings  │             │ • Fraud Stamp Verdict │
     └───────────────────────┘             └───────────────────────┘             └───────────────────────┘
```

---

## 🚨 Core Zones & Demonstrable Functionality

### 1. 🚧 Civic Action (The Yellow Zone — Primary Hub)
Engineered for rapid public hazard detection, depth profiling, and municipal accountability.
- **Multimodal Viewfinder**: Live device rear-camera streaming (`facingMode: "environment"`) with animated holographic corner brackets, center reticle, and sweeping scanner laser overlay.
- **Capture Modes**:
  - **Photo**: Instant camera frame freeze via off-screen HTML5 canvas conversion.
  - **Upload**: Direct image upload (`.jpg`, `.png`, `.webp`) with strict 10MB size validation.
- **2-Step Review & Confirm Workflow**:
  - Freezes telemetry, locks GPS coordinates (accuracy ±1.2m), and presents a **Captured Media Review** stage before committing data to AI analysis.
  - **Smart Retake Action**: Completely clears previous uploads/captures, purges memory frames, resets file inputs, and re-activates the live viewfinder seamlessly.
- **Automated Municipal Triage & Priority Scoring**:
  - Deterministic 0–100 priority score based on documented weights (Safety Impact, Severity, Cluster Velocity, Recency, Evidence Quality).
  - Reverse geocoding to sovereign jurisdictions (e.g. PCMC Ward 14 Public Works Dept).
  - **Downloadable Docket Export**: Generates standards-compliant downloadable JSON and CSV report files for citizen records.

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

## 🧪 Automated Testing Suite (Phase 2 Requirement)

Nexus features a zero-dependency automated test suite powered by the native Node.js test runner (`node:test` and `node:assert/strict`).

### Run All Tests
```bash
npm test
```

### Run Code Syntax & Lint Checks
```bash
npm run lint
```

### Test Suite Structure & Coverage

| Test File | Suites | Tests | Focus Areas |
|---|---|---|---|
| `test/core-logic.test.js` | 4 | 12 | Deterministic priority scoring, reproducible calculations, Jaccard text similarity, Haversine geographic distance, coordinate boundaries, file constraints. |
| `test/api-engine.test.js` | 3 | 6 | HTTP methods (POST vs GET 405), CORS headers, parameter validation (missing zone/content), invalid zone rejection, missing API key handling. |
| `test/schema-validation.test.js` | 4 | 8 | XSS escaping & sanitization, Civic AI schema validation, Med-Scanner schema parsing, Scam Shield threat score clamping (0–100). |
| `test/regression.test.js` | 3 | 5 | Input immutability, monotonic score ordering across severities, duplicate candidate ranking, JSON/CSV export serialization. |
| `test/ui-behavior.test.js` | 3 | 5 | Router zone guards, whitespace form validation, empty input handling, explicit heuristic fallback stamping. |
| **Total** | **17 Suites** | **36 Tests** | **100% Pass Rate (0 Failures, 0 Skipped)** |

---

## ♿ Accessibility & Inclusive Design (WCAG 2.1 AA)

- **Keyboard Focus Indicators**: High-contrast, glowing 2px focus rings (`:focus-visible`) across all interactive buttons, inputs, tabs, and action cards.
- **Reduced Motion Support**: Comprehensive `@media (prefers-reduced-motion: reduce)` styles disable laser animations, radar spinners, and transition delays for users with vestibular/motion sensitivities.
- **Screen Reader Support**:
  - `.sr-only` descriptive `<label>` tags on all form textareas and inputs.
  - Explicit `aria-label` attributes on file inputs, mode pills, and icon action buttons.
  - Accessible live region (`role="status"`, `aria-live="polite"`) on `#toastPill` for dynamic feedback.
  - Modal overlay conforms to WAI-ARIA Dialog pattern (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`).
- **Touch Target Sizing**: Minimum 40px–44px clickable target heights across mobile bottom dock and desktop controls.
- **Non-Color Signaling**: All status indicators pair color with distinct icons and bold text labels (e.g. `CRITICAL FRAUD` with skull icon, `VERIFIED SAFE` with checkmark).

---

## 📊 Priority Scoring Formula & Duplicate Matching

### 1. Deterministic Priority Scoring (0–100)
The priority score is computed deterministically in `js/validator.js` using five documented factors:

$$\text{Priority Score} = S_{\text{safety}} + S_{\text{severity}} + S_{\text{duplicates}} + S_{\text{recency}} + S_{\text{evidence}}$$

| Factor | Range | Description |
|---|---|---|
| **Safety Impact ($S_{\text{safety}}$)** | 0 – 35 pts | Based on hazard type (Electrical: 35, Open Manhole: 33, Road Damage: 28, Pothole: 26, Drainage: 20, Waste: 14, Streetlight: 12). |
| **Severity Level ($S_{\text{severity}}$)** | 0 – 25 pts | CRITICAL: 25, HIGH: 19, MODERATE: 12, LOW: 6. |
| **Cluster Velocity ($S_{\text{duplicates}}$)** | 0 – 15 pts | 5 points per independent matching duplicate report (capped at 15 pts). |
| **Time Urgency ($S_{\text{recency}}$)** | 0 – 15 pts | 0–6h: 4 pts, 6–24h: 8 pts, 24–48h: 12 pts, >48h: 15 pts. |
| **Evidence Quality ($S_{\text{evidence}}$)** | 0 – 10 pts | Verified photo attached: +5 pts; Verified GPS telemetry: +5 pts. |

### 2. Transparent Duplicate Detection
Candidates are evaluated against existing records using a weighted composite score:
- **Category Match (30%)**: Exact match between reported hazard types.
- **Text Similarity (40%)**: Jaccard token coefficient on normalized word tokens.
- **Spatial Proximity (30%)**: Haversine geodesic distance in meters (flags reports within 150m).

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

## 🔒 Security & Environment Architecture

To protect API credentials from theft or abuse, Nexus uses a **Serverless API Bridge**:
- The client-side browser **never** contains or exposes the Google Gemini API key.
- All multimodal analysis requests are dispatched to `/api/nexus-engine`.
- The serverless backend securely reads `process.env.GEMINI_API_KEY` to authenticate with Google's Generative AI servers.
- **Payload Safety**: Requests exceeding 15MB are safely rejected with HTTP 413.
- **Input Sanitization**: All AI and user strings are sanitized against XSS before DOM insertion.
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

### 4. Run Tests & Linting
```bash
npm test
npm run lint
```

### 5. Run Locally

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
├── index.html              # Main application shell (accessible 3-zone layout)
├── css/
│   ├── theme.css           # Design tokens, :focus-visible, prefers-reduced-motion & reset
│   ├── layout.css          # Responsive 2-column command center & sticky mobile dock
│   └── zones.css           # Zone layouts, camera HUD, preview cards & review stages
├── js/
│   ├── app.js              # Application coordinator, hotkeys, theme sync & navigation
│   ├── zones.js            # Civic Action, Med-Scanner & Scam Shield feature logic
│   ├── validator.js        # Isomorphic validation, priority scoring & duplicate matching
│   ├── hardware.js         # Camera stream, video frame capture & Geolocation (GPS)
│   ├── audio.js            # Procedural Web Audio API sound synthesizer
│   └── api.js              # Fetch client bridge with error handling
├── api/
│   └── nexus-engine.js     # Serverless Google Gemini 1.5 Flash multimodal AI engine
├── test/
│   ├── core-logic.test.js  # Priority scoring, duplicates, GPS Haversine tests
│   ├── api-engine.test.js  # HTTP contracts, CORS, parameter validation tests
│   ├── schema-validation.test.js # Schema validation, XSS escaping tests
│   ├── regression.test.js  # Immutability, monotonicity, data export tests
│   └── ui-behavior.test.js # Router guards, empty inputs, fallback stamping tests
├── .env.example            # Template for environment configuration
├── .gitignore              # Ignores .env, node_modules, and cache files
├── package.json            # Node.js dependencies, lint and test scripts
├── vercel.json             # Vercel serverless function routing rules
└── README.md               # Complete project documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Built for PromptWars × Alta School of Technology × Google for Developers.
