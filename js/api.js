/**
 * ==============================================================================
 * NEXUS ENGINE API CLIENT
 * Multimodal AI Integration for Emergency & Civic Action
 * Submits user inputs (Base64 media, audio, or text) to /api/nexus-engine
 * ==============================================================================
 */

async function callNexusEngine(zoneType, inputContent, mimeType = "text/plain") {
  try {
    console.log(`[Nexus Client] Transmitting ${zoneType} payload (${mimeType})...`);

    const payload = {
      zoneType: zoneType,          // "SOS" | "CIVIC" | "MED" | "SCAM"
      inputContent: inputContent,  // Base64 string (data:image/jpeg;base64,...) or text
      mimeType: mimeType           // "image/jpeg" | "audio/webm" | "text/plain" | etc.
    };

    const response = await fetch("/api/nexus-engine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    }

    // Parse clean JSON output returned by Gemini 1.5 Flash
    const structuredResult = await response.json();
    console.log("[Nexus Client] Structured AI Evaluation Response:", structuredResult);
    
    return structuredResult;
  } catch (error) {
    console.error("[Nexus Client] Failed to reach Nexus Engine:", error);
    throw error;
  }
}

// Attach to global window
window.callNexusEngine = callNexusEngine;
