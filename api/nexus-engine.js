try {
  require("dotenv").config();
} catch (e) {
  // Dotenv is optional in serverless production environments
}

const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Vercel Serverless Function: /api/nexus-engine
 * Multimodal Backend Engine for Nexus Emergency & Civic Action
 */
module.exports = async function handler(req, res) {
  // 1. Set standard CORS headers for cross-origin or local requests
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Ensure request is POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed. Please send a POST request with a JSON payload."
    });
  }

  // 2. Validate API Key from environment
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY environment variable. Please configure it in your Vercel project or local .env file."
    });
  }

  try {
    // 3. Parse and validate input payload
    let { zoneType, inputContent, mimeType, location, transcript } = req.body || {};

    if (!zoneType || !inputContent) {
      return res.status(400).json({
        error: "Bad Request. Both 'zoneType' (SOS, CIVIC, MED, SCAM) and 'inputContent' are required."
      });
    }

    // Auto-detect MIME type from Base64 data URL header if not explicitly provided
    if (!mimeType) {
      if (inputContent.startsWith("data:")) {
        const mimeMatch = inputContent.match(/^data:([^;]+);base64,/);
        mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      } else {
        mimeType = "text/plain";
      }
    }

    const locationMeta = location
      ? `\n\nVerified User GPS Telemetry: Lat ${location.latitude || location.lat || "Unknown"}, Lon ${location.longitude || location.lng || "Unknown"} (Accuracy: ±${location.accuracy || "2"}m)`
      : "";

    const transcriptMeta = transcript
      ? `\n\nCaller Spoken Distress Audio Transcript: "${transcript}"`
      : "";

    const normalizedZone = zoneType.toUpperCase().trim();

    // 4. Initialize Google Generative AI SDK with gemini-1.5-flash
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    // 5. Dynamic System Prompting based on active zone
    let systemPrompt = "";

    switch (normalizedZone) {
      case "SOS":
        systemPrompt = `
You are the NEXUS Central Emergency Dispatcher AI.
Your role: Evaluate incoming multimodal distress beacons, incident notes, sensor telemetry, and dispatch the EXACT corresponding response service.

CRITICAL DISPATCH CLASSIFICATION DIRECTIVE:
You MUST classify the EXACT incident type according to what the user reports. NEVER default to Police unless there is an actual crime/physical security threat:

1. MEDICAL EMERGENCY / TRAUMA:
   Triggered by: Injuries, chot, bleeding, blood, hurt, fracture, cuts, burns, wounds, heart attack, chest pain, asthma, breathing issues, fainting, unconsciousness, stroke, seizure, medical distress.
   - incidentType: "Medical Trauma"
   - dispatchUnit: "Medic Trauma ALS #108"
   - unitSub: "Advanced Life Support Unit • Mobile Defibrillator Equipped"
   - unitIcon: "fa-truck-medical"
   - accentColor: "#ec4899"
   - statusBadge: "Ambulance Dispatched"
   - ambulanceETA: "4 mins"
   - triageInstruction: "Keep patient still and calm. Apply firm direct pressure to bleeding wounds. Monitor breathing until paramedics arrive."
   - callText: "Call Ambulance (108)"
   - callNum: "108"

2. PHYSICAL DANGER / CRIME (POLICE):
   Triggered strictly by: Burglary, theft, chori, robbery, physical attack, intruder, violence, weapons, stalker, threat, danger.
   - incidentType: "Physical Danger"
   - dispatchUnit: "Police PCR Interceptor #112"
   - unitSub: "Armed Rapid Response Patrol • Sector 7 Grid"
   - unitIcon: "fa-shield-halved"
   - accentColor: "#38bdf8"
   - statusBadge: "Police Tactical Unit Dispatched"
   - ambulanceETA: "2 mins"
   - triageInstruction: "Lock and barricade all doors. Stay in a silent room with lights off. Armed police units are converging on your GPS coordinates."
   - callText: "Call Police PCR (112)"
   - callNum: "112"

3. MUNICIPAL / CIVIC EMERGENCY:
   Triggered by: Potholes, road collapse, khadda, open manholes, leaking water pipelines, fallen electric wires, broken streetlights, garbage overflow, public civic hazards.
   - incidentType: "Municipal / Civic Emergency"
   - dispatchUnit: "PCMC Municipal Rapid Works #1916"
   - unitSub: "Emergency PWD & Public Infrastructure Fleet"
   - unitIcon: "fa-city"
   - accentColor: "#f59e0b"
   - statusBadge: "Municipal Squad Dispatched"
   - ambulanceETA: "15 mins"
   - triageInstruction: "Keep safe clearance from open manholes, damaged asphalt, and downed electrical lines. Area tagged for municipal emergency repair."
   - callText: "Call Municipal Helpline (1916)"
   - callNum: "1916"

4. FIRE / EXPLOSION EMERGENCY:
   Triggered by: Fire, aag, smoke, dhuan, gas leak, cylinder explosion, burning building, flames.
   - incidentType: "Fire Emergency"
   - dispatchUnit: "Fire Tender Engine #101"
   - unitSub: "Central Fire Station • Aerial Ladder & Water Foam Squad"
   - unitIcon: "fa-fire-extinguisher"
   - accentColor: "#ef4444"
   - statusBadge: "Fire Brigade Dispatched"
   - ambulanceETA: "3 mins"
   - triageInstruction: "Evacuate the premises immediately. Stay low beneath smoke layer. DO NOT use elevators."
   - callText: "Call Fire Station (101)"
   - callNum: "101"

5. ROAD TRAFFIC ACCIDENT:
   Triggered by: Vehicle collision, car crash, bike accident, highway rollover, overturned vehicle.
   - incidentType: "Road Accident"
   - dispatchUnit: "Highway Emergency Rescue #1073"
   - unitSub: "Traffic Police & Hydraulic Rescue Squad"
   - unitIcon: "fa-car-burst"
   - accentColor: "#f97316"
   - statusBadge: "Traffic Rescue & EMS Dispatched"
   - ambulanceETA: "4 mins"
   - triageInstruction: "Do not move severely injured victims unless immediate fire threat. Switch on hazard blinkers to warn oncoming traffic."
   - callText: "Call Highway Rescue (1073)"
   - callNum: "1073"

Return a clean JSON object with this exact structure:
{
  "emergencyDetected": true,
  "severity": "CRITICAL" | "HIGH" | "MODERATE",
  "incidentType": "Medical Trauma" | "Physical Danger" | "Municipal / Civic Emergency" | "Fire Emergency" | "Road Accident",
  "confidenceScore": 0.99,
  "extractedCoordinates": "18.6272, 73.8007",
  "addressHint": "Extracted landmark or bypass corridor",
  "dispatchUnit": "Specific unit name based on incident",
  "unitSub": "Unit description",
  "unitIcon": "fa-truck-medical" | "fa-shield-halved" | "fa-city" | "fa-fire-extinguisher" | "fa-car-burst",
  "accentColor": "#ec4899" | "#38bdf8" | "#f59e0b" | "#ef4444" | "#f97316",
  "triageInstruction": "Immediate life-saving guidance for the situation",
  "ambulanceETA": "4 mins",
  "statusBadge": "Unit Dispatched",
  "callText": "Call Button Label",
  "callNum": "108" | "112" | "1916" | "101" | "1073"
}
`;
        break;

      case "CIVIC":
        systemPrompt = `
You are the NEXUS Municipal Infrastructure Sentinel AI.
Your role: Classify citizen-reported road damage, dangerous potholes, open manholes, downed electric cables, water logging, or public hazards from photos, video frames, or text reports.

Return a clean JSON object with this exact structure:
{
  "issue": "Severe Asphalt Cavity (Pothole)",
  "severity": "CRITICAL" | "MODERATE" | "LOW",
  "estimatedDepthOrDimension": "Estimated size (e.g. 42cm depth, 1.2m diameter)",
  "hazardCategory": "Road Hazard" | "Electrical" | "Sanitation" | "Public Safety",
  "jurisdiction": "PCMC Ward 14 Public Works Dept",
  "workOrderNumber": "MH-CIVIC-8921",
  "actionTaken": "Municipal Work Order Filed",
  "slaTargetHours": 24,
  "safetyRecommendation": "Cordon off lane and dispatch rapid patching crew"
}
`;
        break;

      case "MED":
        systemPrompt = `
You are the NEXUS Emergency Clinical Data & Optical Triage Specialist AI.
Your role: Decipher messy handwritten prescriptions, patient discharge summaries, lab reports, or audio dictations.
CRITICAL SAFETY DIRECTIVE: Extract and PROMINENTLY HIGHLIGHT all life-threatening drug allergies, adverse reactions, active prescriptions, and past medical history.

Return a clean JSON object with this exact structure:
{
  "patientName": "Extracted or Anonymous",
  "bloodGroup": "O+ Positive",
  "allergies": [
    {
      "substance": "Penicillin",
      "reaction": "Severe Anaphylaxis",
      "severity": "CRITICAL"
    },
    {
      "substance": "Sulfa Drugs",
      "reaction": "Severe Urticaria & Rash",
      "severity": "HIGH"
    }
  ],
  "currentMedications": [
    {
      "name": "Metformin Hydrochloride",
      "dosage": "500 MG",
      "frequency": "Twice daily after meals"
    },
    {
      "name": "Atorvastatin Calcium",
      "dosage": "20 MG",
      "frequency": "Once daily at bedtime"
    }
  ],
  "pastHistory": [
    "Type 2 Diabetes Mellitus",
    "Essential Hypertension",
    "Appendectomy (2019)"
  ],
  "contraindicationWarning": "DO NOT ADMINISTER BETA-LACTAM ANTIBIOTICS"
}
`;
        break;

      case "SCAM":
        systemPrompt = `
You are the NEXUS Cyber Defense Forensic Analyst & Fraud Document Verification AI.
Your role: Investigate suspicious text messages, phishing links, emails, AND submitted documents, traffic e-challans, police arrest warrants, court summons, electricity disconnection notices, or bank KYC letters.

Perform a deep forensic audit:
1. Document & Seal Verification: Check for forged government emblems (e.g. Parivahan, State Police, CBI, ED, Income Tax), mismatched fonts, low-res pixelated seals, and fake officer signatures.
2. Link & Payment Route Audit: Check for deceptive URLs, typosquatted domains, suspicious APK download links, or personal UPI IDs masquerading as official government payment gateways (e.g. comparing against echallan.parivahan.gov.in or official utility portals).
3. Coercion & Panic Heuristics: Identify false urgency (e.g. "Account Frozen in 24h", "Arrest Warrant Issued", "Vehicle Seizure in 2 hours") designed to bypass rational judgment.
4. Threat Signatures: Check against known scam kits ("Digital Arrest scam", "Fake Traffic Challan APK scam", "Electricity bill blackout fraud", "Lottery / Telegram task fraud").

Return a clean JSON object with this exact structure:
{
  "isScam": true,
  "verdictStamp": "FRAUDULENT DOCUMENT" | "PHISHING DETECTED" | "VERIFIED SAFE",
  "headline": "🚨 SCAM DETECTED: Fake Traffic E-Challan / Police Notice",
  "documentOrContentType": "Traffic E-Challan" | "Police Arrest Warrant" | "Electricity Notice" | "Banking Phishing" | "Legitimate Document",
  "threatScore": 98.4,
  "threatLevel": "CRITICAL DANGER" | "ELEVATED RISK" | "MINIMAL RISK",
  "summary": "Concise forensic summary of why this document/message is fraudulent or authentic",
  "evidence": [
    "Forged official emblem with mismatched typography",
    "Links to deceptive APK payload/fake payment gateway instead of official portal",
    "Coercive urgency threatening immediate arrest or account suspension"
  ],
  "officialVerificationPortal": "echallan.parivahan.gov.in or relevant official sovereign portal",
  "recommendedAction": "Do not pay or scan the QR code. Block sender and report immediately to National Cybercrime Portal (1930)."
}
`;
        break;

      default:
        return res.status(400).json({
          error: `Invalid zoneType '${zoneType}'. Must be one of: 'SOS', 'CIVIC', 'MED', 'SCAM'.`
        });
    }

    // 6. Build Multimodal Content Payload
    let contents = [];

    // Check if input is a base64 encoded media file (image, audio, pdf) or plain text
    const isMedia = mimeType.startsWith("image/") || mimeType.startsWith("audio/") || mimeType === "application/pdf";

    if (isMedia) {
      // Strip base64 data URL prefix if present (e.g. data:image/jpeg;base64,...)
      const cleanedBase64 = inputContent.replace(/^data:[^;]+;base64,/, "");

      const mediaPart = {
        inlineData: {
          data: cleanedBase64,
          mimeType: mimeType
        }
      };

      contents = [
        systemPrompt + locationMeta + transcriptMeta,
        "Analyze this user-submitted media evidence and spoken voice transcript to provide the exact emergency dispatch metadata according to your protocol instructions.",
        mediaPart
      ];
    } else {
      // Standard text / transcript input
      contents = [
        systemPrompt + locationMeta + transcriptMeta,
        `User Input / Incident Transcript:\n"""\n${inputContent}\n"""`
      ];
    }

    // 7. Execute Gemini model inference
    const result = await model.generateContent(contents);
    const response = await result.response;
    const responseText = response.text();

    // 8. Parse guaranteed JSON output (enforced by responseMimeType: "application/json")
    let structuredJson = {};
    try {
      structuredJson = JSON.parse(responseText);
    } catch (parseError) {
      // Fallback clean-up in case of unexpected character wrapping
      const cleanJsonString = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      structuredJson = JSON.parse(cleanJsonString);
    }

    // 9. Send successful response
    return res.status(200).json(structuredJson);

  } catch (error) {
    console.error("Nexus Engine API Error:", error);
    return res.status(500).json({
      error: "Internal Server Error in Nexus Engine",
      message: error.message || "An unexpected error occurred during multimodal analysis."
    });
  }
};
