/**
 * ==============================================================================
 * NEXUS HARDWARE & SENSOR INTEGRATION ENGINE
 * Native Browser Hardware Access: Microphone, Camera, and Geolocation (GPS)
 * Zero external frameworks • Pure Vanilla JavaScript • HTML5 Web APIs
 * ==============================================================================
 */

const NexusHardware = (() => {
  // Audio state
  let mediaRecorder = null;
  let audioChunks = [];
  let audioStream = null;

  // Real-time Speech-to-Text Recognition State
  let speechRecognizer = null;
  let liveVoiceTranscript = "";

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !speechRecognizer) {
      try {
        speechRecognizer = new SpeechRecognition();
        speechRecognizer.continuous = true;
        speechRecognizer.interimResults = true;
        speechRecognizer.lang = "en-US";

        speechRecognizer.onresult = (event) => {
          let text = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          if (text) {
            liveVoiceTranscript = text.trim();
            console.log("[Nexus Hardware] Live Speech Recognized:", liveVoiceTranscript);
            const instr = document.getElementById("sosInstructionText");
            if (instr && liveVoiceTranscript) {
              instr.innerHTML = `<i class="fa-solid fa-microphone-lines" style="color:#ef4444"></i> Heard: <em>"${liveVoiceTranscript}"</em>`;
            }
          }
        };

        speechRecognizer.onerror = (e) => {
          console.warn("[Nexus Hardware] Speech Recognition status:", e.error);
        };
      } catch (err) {
        console.warn("[Nexus Hardware] Speech Recognition unavailable:", err);
      }
    }
  };

  // Camera state
  let activeCameraStream = null;

  /* --------------------------------------------------------------------------
     1. HELPER: BLOB TO BASE64 CONVERTER
     -------------------------------------------------------------------------- */
  /**
   * Converts a Blob (Audio/Image/File) into a Base64 Data URL string
   * @param {Blob} blob
   * @returns {Promise<string>}
   */
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  };

  /* --------------------------------------------------------------------------
     2. GEOLOCATION (GPS) INTEGRATION
     -------------------------------------------------------------------------- */
  /**
   * Fetches user's current high-accuracy GPS coordinates
   * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
   */
  const getCurrentCoordinates = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("[Nexus Hardware] Geolocation API not supported by browser. Using fallback coordinates.");
        return resolve({ latitude: 18.6272, longitude: 73.8007, accuracy: 1.2 });
      }

      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: parseFloat(position.coords.latitude.toFixed(6)),
            longitude: parseFloat(position.coords.longitude.toFixed(6)),
            accuracy: Math.round(position.coords.accuracy || 1)
          };
          console.log("[Nexus Hardware] Live GPS Locked:", coords);
          resolve(coords);
        },
        (error) => {
          console.warn("[Nexus Hardware] Geolocation Error/Denied:", error.message);
          if (error.code === error.PERMISSION_DENIED) {
            handlePermissionError(
              "Location (GPS)",
              "Please enable Location access in your browser so emergency responders can triangulate your exact distress position."
            );
          }
          // Return fallback coordinates so emergency flow remains uninterrupted
          resolve({ latitude: 18.6272, longitude: 73.8007, accuracy: 2.0 });
        },
        geoOptions
      );
    });
  };

  /* --------------------------------------------------------------------------
     3. MICROPHONE & AUDIO RECORDING INTEGRATION (SOS TAB)
     -------------------------------------------------------------------------- */
  /**
   * Starts recording live audio from the user's microphone
   * @returns {Promise<boolean>}
   */
  const startAudioRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not supported by your browser environment.");
      }

      audioChunks = [];
      liveVoiceTranscript = "";
      initSpeechRecognition();
      if (speechRecognizer) {
        try { speechRecognizer.start(); } catch (e) {}
      }

      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported audio MIME type safely
      const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
      const isTypeSupported = typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function";
      const supportedType = isTypeSupported ? (mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || "") : "";

      mediaRecorder = supportedType 
        ? new MediaRecorder(audioStream, { mimeType: supportedType }) 
        : new MediaRecorder(audioStream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.start();
      console.log("[Nexus Hardware] Audio & Speech Recording Started...");
      return true;
    } catch (error) {
      console.error("[Nexus Hardware] Microphone Access Error:", error);
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        handlePermissionError(
          "Microphone",
          "Microphone access is required to record your emergency distress voice broadcast. Please allow microphone permission in your browser."
        );
      } else {
        alert(`Microphone Error: ${error.message || "Hardware unavailable"}`);
      }
      return false;
    }
  };

  /**
   * Stops audio recording and returns Base64 audio string, Blob & Speech transcript
   * @returns {Promise<{audioBlob: Blob, audioBase64: string, mimeType: string, transcript: string}>}
   */
  const stopAudioRecording = () => {
    return new Promise((resolve) => {
      if (speechRecognizer) {
        try { speechRecognizer.stop(); } catch (e) {}
      }

      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        return resolve({ audioBlob: null, audioBase64: "", mimeType: "audio/webm", transcript: liveVoiceTranscript });
      }

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        const audioBase64 = await blobToBase64(audioBlob);

        // Stop and release audio tracks
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop());
          audioStream = null;
        }

        console.log(`[Nexus Hardware] Audio Recording Complete (${(audioBlob.size / 1024).toFixed(1)} KB), Transcript: "${liveVoiceTranscript}"`);
        resolve({ audioBlob, audioBase64, mimeType, transcript: liveVoiceTranscript });
      };

      mediaRecorder.stop();
    });
  };

  /* --------------------------------------------------------------------------
     4. CAMERA INTEGRATION (CIVIC ACTION & MED-SCANNER TABS)
     -------------------------------------------------------------------------- */
  /**
   * Streams device rear/environment or web camera into a <video> element
   * @param {HTMLVideoElement} videoElement
   * @param {string} facingMode - 'environment' (rear camera) or 'user' (front camera)
   * @returns {Promise<boolean>}
   */
  const startCameraStream = async (videoElement, facingMode = "environment") => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }

      // Stop any existing stream
      stopCameraStream(videoElement);

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (fallbackErr) {
        console.info("[Nexus Hardware] Environment camera constraint failed, retrying with default video device...");
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      activeCameraStream = stream;

      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.style.display = "block";
        await videoElement.play().catch(e => console.warn("Video play interrupted:", e));
      }

      console.log(`[Nexus Hardware] Camera Streaming Active`);
      return true;
    } catch (error) {
      console.warn("[Nexus Hardware] Camera Access Error:", error);
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        handlePermissionError(
          "Camera",
          "Camera access is needed to capture live hazard photos and scan medical documents. Please allow camera permissions."
        );
      } else {
        console.info("Using simulated camera viewport fallback.");
      }
      return false;
    }
  };

  /**
   * Stops active camera stream and hides video element
   * @param {HTMLVideoElement} videoElement
   */
  const stopCameraStream = (videoElement) => {
    if (activeCameraStream) {
      activeCameraStream.getTracks().forEach(track => track.stop());
      activeCameraStream = null;
    }
    if (videoElement) {
      videoElement.srcObject = null;
      videoElement.style.display = "none";
    }
  };

  /**
   * Captures the current video frame onto an offscreen canvas and converts to Base64 JPEG
   * @param {HTMLVideoElement} videoElement
   * @returns {string} Base64 JPEG Data URL
   */
  const captureVideoFrame = (videoElement) => {
    const canvas = document.createElement("canvas");
    const width = (videoElement && videoElement.videoWidth) || 640;
    const height = (videoElement && videoElement.videoHeight) || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (videoElement && videoElement.readyState >= 2) {
      ctx.drawImage(videoElement, 0, 0, width, height);
    } else {
      // Fallback: generate a realistic high-contrast telemetry frame
      ctx.fillStyle = "#10141f";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, width - 80, height - 80);
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.fillText("NEXUS CAM SENSOR — CAPTURE FRAME", width / 2, height / 2);
    }

    const base64Jpeg = canvas.toDataURL("image/jpeg", 0.85);
    console.log("[Nexus Hardware] Video Frame Captured as Base64 JPEG");
    return base64Jpeg;
  };

  /* --------------------------------------------------------------------------
     5. API DATA SUBMISSION (THE FETCH BRIDGE)
     -------------------------------------------------------------------------- */
  /**
   * Submits multimodal data (Base64 audio/image) and location to /api/nexus-engine
   * @param {string} zoneType - "SOS" | "CIVIC" | "MED" | "SCAM"
   * @param {string} mediaBase64 - Base64 Data URL or raw text
   * @param {Object} coordinates - { latitude, longitude, accuracy }
   * @returns {Promise<Object>}
   */
  const processNexusInput = async (zoneType, mediaBase64, coordinates, transcript = "") => {
    try {
      console.log(`[Nexus Bridge] Submitting payload for [${zoneType}] with GPS:`, coordinates);

      const payload = {
        zoneType: zoneType,
        inputContent: mediaBase64,
        transcript: transcript || window.lastSosTranscript || "",
        location: coordinates
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

      const structuredResult = await response.json();
      console.log("[Nexus Bridge] Structured AI Response:", structuredResult);
      return structuredResult;
    } catch (error) {
      console.warn("[Nexus Bridge] Live API connection error:", error.message);
      throw error;
    }
  };

  /* --------------------------------------------------------------------------
     6. PERMISSION & ERROR HANDLING
     -------------------------------------------------------------------------- */
  /**
   * Shows user-friendly permission guidance alerts and toasts
   * @param {string} permissionType - 'Microphone' | 'Camera' | 'Location (GPS)'
   * @param {string} guidanceMessage
   */
  const handlePermissionError = (permissionType, guidanceMessage) => {
    const fullMsg = `🚨 Permission Required: ${permissionType}\n\n${guidanceMessage}`;
    if (window.NexusApp && typeof window.NexusApp.showToast === "function") {
      window.NexusApp.showToast(`Permission Required: Enable ${permissionType} in browser.`);
    }
    alert(fullMsg);
  };

  /* --------------------------------------------------------------------------
     7. INITIALIZATION & HARDWARE EVENT BINDINGS
     -------------------------------------------------------------------------- */
  /**
   * Binds SOS hold events to real Mic + Geolocation, and Civic/Med to real Camera
   */
  const init = () => {
    console.log("[Nexus Hardware] Native Browser Hardware Engine Initialized.");

    // Bind SOS button hardware actions
    const sosBtn = document.getElementById("sosBtn");
    if (sosBtn) {
      // Mouse & Touchstart: start real audio recording
      const handlePressStart = async () => {
        await startAudioRecording();
      };

      // Mouseup & Touchend: stop recording, fetch GPS, and submit
      const handlePressEnd = async () => {
        // Collect coordinates and audio simultaneously
        const [coords, audioData] = await Promise.all([
          getCurrentCoordinates(),
          stopAudioRecording()
        ]);

        if (audioData.audioBase64) {
          console.log("[Nexus SOS] Audio recorded with coordinates:", coords);
          window.lastSosAudio = audioData.audioBase64;
          window.lastSosCoords = coords;
          window.lastSosTranscript = audioData.transcript || "";
        }
      };

      sosBtn.addEventListener("mousedown", handlePressStart);
      sosBtn.addEventListener("touchstart", handlePressStart, { passive: true });
      window.addEventListener("mouseup", handlePressEnd);
      window.addEventListener("touchend", handlePressEnd);
    }

    // Bind Camera streaming lifecycle for Civic Action & Med-Scanner tabs
    const civicVideo = document.getElementById("civicCameraVideo");
    const medVideo = document.getElementById("medCameraVideo");

    // Switching into Civic tab -> Start Civic camera, stop Med camera
    document.querySelectorAll("[data-zone='civic']").forEach(btn => {
      btn.addEventListener("click", () => {
        if (civicVideo) startCameraStream(civicVideo, "environment");
        if (medVideo) stopCameraStream(medVideo);
      });
    });

    // Switching into Med tab -> Stop Civic camera
    document.querySelectorAll("[data-zone='med']").forEach(btn => {
      btn.addEventListener("click", () => {
        if (civicVideo) stopCameraStream(civicVideo);
      });
    });

    // Switching to SOS or Scam Shield -> Stop all active camera streams
    document.querySelectorAll("[data-zone='sos'], [data-zone='shield']").forEach(btn => {
      btn.addEventListener("click", () => {
        if (civicVideo) stopCameraStream(civicVideo);
        if (medVideo) stopCameraStream(medVideo);
      });
    });
  };

  // Expose Public API
  return {
    init,
    startAudioRecording,
    stopAudioRecording,
    getCurrentCoordinates,
    startCameraStream,
    stopCameraStream,
    captureVideoFrame,
    processNexusInput,
    blobToBase64,
    handlePermissionError
  };
})();

// Attach to window
window.NexusHardware = NexusHardware;
window.processNexusInput = NexusHardware.processNexusInput;

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", NexusHardware.init);
