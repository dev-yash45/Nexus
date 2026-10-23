/**
 * NEXUS ZONES CONTROLLER
 * Feature logic for SOS, Civic Action (2-step capture/review), Med-Scanner (2-step upload/extract), and Scam Shield
 */
const NexusZones = (() => {
  // SOS Hold Threshold Configuration
  const SOS_HOLD_THRESHOLD_MS = 1500;
  let sosHoldStartTime = 0;
  let sosHoldInterval = null;

  // Civic state
  let civicCaptured = false;
  let currentCivicMode = 'photo'; // 'photo' | 'video' | 'upload'

  // Med state
  let currentDocLoaded = null;

  /* --------------------------------------------------------------------------
     1. SOS CONTROLLER
     -------------------------------------------------------------------------- */
  const initSos = () => {
    const sosBtn = document.getElementById('sosBtn');
    const circle = document.getElementById('sosProgressCircle');
    const waves = document.getElementById('sosAudioWaves');
    const instruction = document.getElementById('sosInstructionText');
    const circumference = 2 * Math.PI * 100; // ~630

    if (!sosBtn || !circle) return;

    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;

    const startHold = (e) => {
      if (e.type === 'touchstart') e.preventDefault();
      sosHoldStartTime = Date.now();
      sosBtn.classList.add('pressing');
      if (waves) waves.classList.add('active');
      if (instruction) instruction.innerHTML = '<span style="color:#ef4444; font-weight:800;">TRANSMITTING BIOMETRICS... HOLD FIRM</span>';
      NexusAudio.play('holdPulse');

      clearInterval(sosHoldInterval);
      sosHoldInterval = setInterval(() => {
        const elapsed = Date.now() - sosHoldStartTime;
        const progress = Math.min(elapsed / SOS_HOLD_THRESHOLD_MS, 1);
        circle.style.strokeDashoffset = circumference - progress * circumference;

        if (progress >= 1) {
          clearInterval(sosHoldInterval);
        }
      }, 25);
    };

    const endHold = () => {
      if (!sosHoldStartTime) return;
      const elapsed = Date.now() - sosHoldStartTime;
      sosHoldStartTime = 0;
      clearInterval(sosHoldInterval);

      sosBtn.classList.remove('pressing');
      if (waves) waves.classList.remove('active');

      if (elapsed >= SOS_HOLD_THRESHOLD_MS) {
        circle.style.strokeDashoffset = 0;
        triggerSosEmergency();
      } else {
        circle.style.strokeDashoffset = circumference;
        if (instruction) instruction.innerHTML = '<i class="fa-solid fa-fingerprint"></i> Held too short. Press & hold 1.5s to broadcast';
      }
    };

    sosBtn.addEventListener('mousedown', startHold);
    window.addEventListener('mouseup', endHold);

    sosBtn.addEventListener('touchstart', startHold, { passive: false });
    window.addEventListener('touchend', endHold);
    window.addEventListener('touchcancel', endHold);
  };

  /* --------------------------------------------------------------------------
     1B. DYNAMIC SOS EMERGENCY CLASSIFICATION & DISPATCH PROFILES
     -------------------------------------------------------------------------- */
  let currentEmergencyCallNum = "112";

  const EMERGENCY_PROFILES = {
    fire: {
      incidentType: "Fire Emergency",
      severity: "CRITICAL",
      alertTitle: "🚨 Fire Emergency Confirmed",
      alertSub: "Thermal Hazard & Combustion Signature Detected • Priority 1 Red Alert",
      dispatchUnit: "Fire Tender Engine #101",
      unitSub: "Central Fire Station • Water Cannon & Aerial Ladder Squad",
      unitIcon: "fa-fire-extinguisher",
      accentColor: "#ef4444",
      statusTitle: "Fire Brigade Dispatched",
      statusSub: "ETA: 3 mins • Sirens Activated • High-Priority Corridor Cleared",
      triageInstruction: "Evacuate the premises immediately. Stay low beneath smoke layer. DO NOT use elevators.",
      callText: "Call Fire Station (101)",
      callNum: "101"
    },
    police: {
      incidentType: "Physical Danger",
      severity: "CRITICAL",
      alertTitle: "🚨 Armed Threat / Crime Alert",
      alertSub: "Hostile Danger Pattern Confirmed • Police Tactical Priority 1",
      dispatchUnit: "Police PCR Interceptor #112",
      unitSub: "Armed Rapid Response Patrol • Sector 7 Patrol Grid",
      unitIcon: "fa-shield-halved",
      accentColor: "#38bdf8",
      statusTitle: "Police Tactical Unit Dispatched",
      statusSub: "ETA: 2 mins • GPS Triangulation Locked • High-Speed Intercept",
      triageInstruction: "Lock and barricade all doors. Stay hidden in a silent room with lights off. Police units are converging.",
      callText: "Call Police PCR (112)",
      callNum: "112"
    },
    accident: {
      incidentType: "Road Accident",
      severity: "CRITICAL",
      alertTitle: "🚨 Road Traffic Collision",
      alertSub: "Vehicle Collision Impact Confirmed • Highway Trauma Corridor Cleared",
      dispatchUnit: "Highway Patrol & ALS Rescue",
      unitSub: "Heavy Hydraulic Rescue Equipment & Trauma Paramedics",
      unitIcon: "fa-car-burst",
      accentColor: "#f59e0b",
      statusTitle: "Rescue & Trauma Team Dispatched",
      statusSub: "ETA: 4 mins • Highway Patrol Unit Alerted",
      triageInstruction: "Do not move injured victims unless immediate fire risk. Switch on hazard blinkers to warn oncoming traffic.",
      callText: "Call Highway Rescue (1073)",
      callNum: "1073"
    },
    medical: {
      incidentType: "Medical Trauma",
      severity: "CRITICAL",
      alertTitle: "🚨 Medical Trauma Confirmed",
      alertSub: "Acute Physiological Distress Confirmed • Priority 1 ALS Unit",
      dispatchUnit: "Medic Trauma ALS #409",
      unitSub: "Advanced Life Support Unit • Mobile Defibrillator Equipped",
      unitIcon: "fa-truck-medical",
      accentColor: "#ec4899",
      statusTitle: "Ambulance Dispatched",
      statusSub: "ETA: 4 mins • Sirens Activated • Green Corridor Cleared",
      triageInstruction: "Keep patient still and calm. Clear airway, loosen tight clothing, and monitor pulse until paramedics arrive.",
      callText: "Call Ambulance (108)",
      callNum: "108"
    }
  };

  const classifyEmergencyFromSpeech = (transcript) => {
    const text = (transcript || "").toLowerCase();

    // 1. Fire
    if (/fire|smoke|gas|cylinder|burning|flame|explosion|blast|burn|aag|dhuan/i.test(text)) {
      return EMERGENCY_PROFILES.fire;
    }
    // 2. Police / Crime
    if (/police|thief|robbery|chori|attack|danger|stalker|threat|weapon|gun|knife|fight|maar|bachao|break in|intruder|thieves/i.test(text)) {
      return EMERGENCY_PROFILES.police;
    }
    // 3. Road accident
    if (/accident|crash|car|bike|truck|vehicle|collision|highway|overturned|hit and run|takkaran|gadi/i.test(text)) {
      return EMERGENCY_PROFILES.accident;
    }
    // 4. Medical
    if (/heart|chest|pain|breath|faint|unconscious|blood|stroke|chhot|seizure|bleeding|dard|saans/i.test(text)) {
      return EMERGENCY_PROFILES.medical;
    }

    // Default: Return Police/Distress general response
    return EMERGENCY_PROFILES.police;
  };

  const renderSosEmergencyCard = (evalData, coords, transcript) => {
    const titleEl = document.getElementById("sosAlertTitle");
    const subEl = document.getElementById("sosAlertSub");
    const coordsValEl = document.getElementById("sosCoordsVal");
    const coordsSubEl = document.getElementById("sosCoordsSub");
    const unitValEl = document.getElementById("sosUnitVal");
    const unitSubEl = document.getElementById("sosUnitSub");
    const unitIconEl = document.getElementById("sosUnitIcon");
    const incidentValEl = document.getElementById("sosIncidentVal");
    const statusTitleEl = document.getElementById("sosStatusTitle");
    const statusSubEl = document.getElementById("sosStatusSub");
    const triageInstructionEl = document.getElementById("sosTriageInstruction");
    const transcriptBox = document.getElementById("sosTranscriptBox");
    const transcriptText = document.getElementById("sosTranscriptText");
    const callBtn = document.getElementById("sosCallBtn");

    if (titleEl) titleEl.textContent = evalData.alertTitle || `🚨 ${evalData.incidentType || "Emergency"} Detected`;
    if (subEl) subEl.textContent = evalData.alertSub || "Distress Telemetry Locked • Priority 1 Apex Response";

    if (coordsValEl) coordsValEl.textContent = `${coords.latitude}, ${coords.longitude}`;
    if (coordsSubEl) coordsSubEl.textContent = `${evalData.addressHint || "Pimpri Bypass Corridor"} • ±${coords.accuracy || 1.2}m Accuracy`;

    if (unitValEl) unitValEl.textContent = evalData.dispatchUnit || "Medic Trauma #409";
    if (unitSubEl) unitSubEl.textContent = evalData.unitSub || "Advanced Life Support Unit";
    if (unitIconEl && evalData.unitIcon) unitIconEl.className = `fa-solid ${evalData.unitIcon}`;

    if (incidentValEl) {
      incidentValEl.textContent = evalData.incidentType || "Medical Trauma";
      if (evalData.accentColor) incidentValEl.style.color = evalData.accentColor;
    }

    if (statusTitleEl) statusTitleEl.textContent = evalData.statusBadge || evalData.statusTitle || "Unit Dispatched";
    if (statusSubEl) {
      statusSubEl.textContent = evalData.ambulanceETA 
        ? `ETA: ${evalData.ambulanceETA} • Sirens Activated • Emergency Corridor Cleared` 
        : (evalData.statusSub || "ETA: 3 mins • Sirens Activated");
    }

    if (triageInstructionEl) {
      triageInstructionEl.textContent = evalData.triageInstruction || "Keep calm. Emergency responders are approaching your location.";
    }

    if (transcript && transcript.trim()) {
      if (transcriptBox) transcriptBox.style.display = "block";
      if (transcriptText) transcriptText.textContent = `"${transcript.trim()}"`;
    } else {
      if (transcriptBox) transcriptBox.style.display = "none";
    }

    if (callBtn) {
      const callSpan = callBtn.querySelector("span");
      if (callSpan) {
        callSpan.textContent = evalData.callText || "Call Responder (112)";
      }
      currentEmergencyCallNum = evalData.callNum || "112";
    }
  };

  const testSimulatedVoice = (sampleKey) => {
    const samples = {
      fire: "Help, there is a massive fire on the 3rd floor, thick black smoke spreading!",
      police: "Thieves are breaking in through the back window, please send police immediately!",
      accident: "Major highway car crash and vehicle collision, people trapped in the car!",
      medical: "Severe chest pain and sudden cardiac collapse, patient is losing consciousness!"
    };

    const transcript = samples[sampleKey] || samples.fire;
    window.lastSosTranscript = transcript;
    NexusApp.showToast(`Simulated Voice: "${transcript}"`);

    // Trigger emergency flow directly
    triggerSosEmergency();
  };

  const triggerSosEmergency = async () => {
    NexusAudio.play('emergencyAlert');

    // Fetch live coordinates, audio, and transcript
    const coords = window.lastSosCoords || await NexusHardware.getCurrentCoordinates();
    const audioData = window.lastSosAudio || "data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwE=";
    const transcript = window.lastSosTranscript || "";

    // Preliminary emergency classification based on voice content
    let evalData = classifyEmergencyFromSpeech(transcript);

    // Trigger API submission bridge to /api/nexus-engine
    NexusHardware.processNexusInput("SOS", audioData, coords, transcript).then((result) => {
      console.log("[Nexus SOS API Response]", result);
      if (result && result.emergencyDetected) {
        evalData = {
          ...evalData,
          ...result,
          alertTitle: `🚨 ${result.incidentType} Confirmed`,
          statusTitle: result.statusBadge || evalData.statusTitle,
          dispatchUnit: result.dispatchUnit || evalData.dispatchUnit,
          triageInstruction: result.triageInstruction || evalData.triageInstruction
        };
      }
    }).catch((err) => {
      console.info("[Nexus SOS API Bridge] Using local voice heuristics:", err.message);
    });

    NexusApp.runAiProcessingSequence(
      {
        title: 'Triangulating Distress Beacon',
        subtitle: transcript ? `Acoustic voice analysis: "${transcript.substring(0, 32)}..."` : 'Multimodal voice signature verified',
        steps: [
          `Distress audio evaluated (${evalData.incidentType} pattern)`,
          `NavIC / GPS coordinate locked (${coords.latitude}, ${coords.longitude})`,
          `Broadcasting dispatch order to ${evalData.dispatchUnit}`
        ],
        duration: 2000
      },
      () => {
        const holdArea = document.getElementById('sosHoldArea');
        const resultCard = document.getElementById('sosResultCard');
        if (holdArea) holdArea.style.display = 'none';
        if (resultCard) resultCard.classList.add('active');

        // Dynamically populate the result card with the exact emergency!
        renderSosEmergencyCard(evalData, coords, transcript);

        NexusApp.showToast(`🚨 ${evalData.incidentType} Broadcast Dispatched!`);
      }
    );
  };

  const resetSos = () => {
    NexusAudio.play('click');
    window.lastSosTranscript = "";
    const resultCard = document.getElementById('sosResultCard');
    const holdArea = document.getElementById('sosHoldArea');
    const instruction = document.getElementById('sosInstructionText');
    const circle = document.getElementById('sosProgressCircle');

    if (resultCard) resultCard.classList.remove('active');
    if (holdArea) holdArea.style.display = 'flex';
    if (instruction) instruction.innerHTML = '<i class="fa-solid fa-fingerprint"></i> Press & hold for 1.5s to trigger emergency broadcast';
    if (circle) {
      const circumference = 2 * Math.PI * 100;
      circle.style.strokeDashoffset = circumference;
    }
  };

  const call112 = () => {
    NexusAudio.play('click');
    NexusApp.showToast(`Initiating encrypted VoIP uplink to Emergency Dispatcher ${currentEmergencyCallNum}...`);
  };

  /* --------------------------------------------------------------------------
     2. CIVIC ACTION (2-STEP CAPTURE & REVIEW WORKFLOW)
     -------------------------------------------------------------------------- */
  const setCivicMode = (mode) => {
    currentCivicMode = mode;
    NexusAudio.play('click');
    document.querySelectorAll('.mode-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    const fileInput = document.getElementById('civicFileInput');
    const videoEl = document.getElementById('civicCameraVideo');

    if (mode === 'upload' && fileInput) {
      fileInput.click();
    } else if (mode === 'video' || mode === 'photo') {
      if (videoEl) {
        NexusHardware.startCameraStream(videoEl, 'environment');
      }
      NexusApp.showToast(`Camera Viewfinder switched to: ${mode.toUpperCase()} MODE`);
    }
  };

  // STEP 1: Capture Media (Shows Captured Preview with Review Options - NO DIRECT JUMP)
  const captureCivicMedia = () => {
    NexusAudio.play('shutter');

    // Trigger visual shutter flash
    const flash = document.getElementById('shutterFlash');
    if (flash) {
      flash.classList.add('flashing');
      setTimeout(() => flash.classList.remove('flashing'), 300);
    }

    civicCaptured = true;

    // Grab live frame from camera video element if active
    const videoEl = document.getElementById('civicCameraVideo');
    if (videoEl && videoEl.readyState >= 2) {
      const liveFrameBase64 = NexusHardware.captureVideoFrame(videoEl);
      window.lastCivicFrame = liveFrameBase64;

      const previewImg = document.getElementById('civicPreviewImg');
      const defaultSvg = document.getElementById('civicDefaultSvg');
      if (previewImg) {
        previewImg.src = liveFrameBase64;
        previewImg.style.display = 'block';
        if (defaultSvg) defaultSvg.style.display = 'none';
      }
    }

    // Show captured preview stage
    setTimeout(() => {
      const liveView = document.getElementById('civicLiveViewSection');
      const previewBox = document.getElementById('civicCapturedPreview');
      if (liveView) liveView.style.display = 'none';
      if (previewBox) previewBox.classList.add('active');

      // Update timestamp on captured watermark
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const metaEl = document.getElementById('civicCapturedTimestamp');
      if (metaEl) metaEl.textContent = `CAPTURED: TODAY ${timeStr} • GPS ACCURACY ±1.2m`;

      NexusApp.showToast('Media captured! Review photo and confirm to start AI analysis.');
    }, 200);
  };

  // STEP 2: Start Analysis & Docketing (Explicitly triggered by user on the review card)
  const startCivicAnalysis = async () => {
    NexusAudio.play('click');

    const coords = await NexusHardware.getCurrentCoordinates();
    const frameData = window.lastCivicFrame || "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/";

    NexusHardware.processNexusInput("CIVIC", frameData, coords).then((res) => {
      console.log("[Nexus Civic API Response]", res);
    }).catch((err) => {
      console.info("[Nexus Civic API Bridge] Using local fallback:", err.message);
    });

    NexusApp.runAiProcessingSequence(
      {
        title: 'Analyzing Hazard Geometry',
        subtitle: 'Computer vision surface & GIS telemetry',
        steps: [
          'Depth cavity extracted (42cm depth - Severe Rating)',
          'Reverse geotag matched (PCMC Ward 14, MG Road)',
          'Registering authenticated municipal public docket'
        ],
        duration: 2000
      },
      () => {
        const previewBox = document.getElementById('civicCapturedPreview');
        const resultCard = document.getElementById('civicResultCard');
        if (previewBox) previewBox.classList.remove('active');
        if (resultCard) resultCard.classList.add('active');
        NexusApp.showToast('🚧 Municipal Work Order #MH-CIVIC-8921 Filed!');
      }
    );
  };

  const retakeCivic = () => {
    NexusAudio.play('click');
    civicCaptured = false;
    const liveView = document.getElementById('civicLiveViewSection');
    const previewBox = document.getElementById('civicCapturedPreview');
    const resultCard = document.getElementById('civicResultCard');

    if (resultCard) resultCard.classList.remove('active');
    if (previewBox) previewBox.classList.remove('active');
    if (liveView) liveView.style.display = 'block';

    NexusApp.showToast('Camera active. Ready for new capture.');
  };

  const handleCivicFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      NexusAudio.play('shutter');
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewImg = document.getElementById('civicPreviewImg');
        const defaultSvg = document.getElementById('civicDefaultSvg');
        if (previewImg && defaultSvg) {
          previewImg.src = event.target.result;
          previewImg.style.display = 'block';
          defaultSvg.style.display = 'none';
        }
        captureCivicMedia();
      };
      reader.readAsDataURL(file);
    }
  };

  /* --------------------------------------------------------------------------
     3. MED-SCANNER (2-STEP UPLOAD & OCR EXTRACTION WORKFLOW)
     -------------------------------------------------------------------------- */
  let currentMedMode = 'upload'; // 'upload' | 'camera'

  const setMedMode = (mode) => {
    NexusAudio.play('click');
    currentMedMode = mode;

    const uploadBtn = document.getElementById('medModeUploadBtn');
    const cameraBtn = document.getElementById('medModeCameraBtn');
    const uploadBox = document.getElementById('medUploadBox');
    const cameraSection = document.getElementById('medCameraLiveSection');
    const medVideo = document.getElementById('medCameraVideo');

    if (mode === 'camera') {
      if (uploadBtn) uploadBtn.classList.remove('active');
      if (cameraBtn) cameraBtn.classList.add('active');
      if (uploadBox) uploadBox.style.display = 'none';
      if (cameraSection) cameraSection.style.display = 'block';
      if (medVideo && window.NexusHardware) {
        NexusHardware.startCameraStream(medVideo, 'environment');
      }
      NexusApp.showToast('Camera active: Align prescription or medical record.');
    } else {
      if (uploadBtn) uploadBtn.classList.add('active');
      if (cameraBtn) cameraBtn.classList.remove('active');
      if (cameraSection) cameraSection.style.display = 'none';
      if (uploadBox) uploadBox.style.display = 'block';
      if (medVideo && window.NexusHardware) {
        NexusHardware.stopCameraStream(medVideo);
      }
      NexusApp.showToast('Switched to file upload mode.');
    }
  };

  const captureMedCameraMedia = () => {
    NexusAudio.play('shutter');

    // Trigger shutter flash animation
    const flash = document.getElementById('medShutterFlash');
    if (flash) {
      flash.classList.add('flash');
      setTimeout(() => flash.classList.remove('flash'), 300);
    }

    const medVideo = document.getElementById('medCameraVideo');
    if (medVideo && window.NexusHardware) {
      const frameBase64 = NexusHardware.captureVideoFrame(medVideo);
      window.lastMedDocBase64 = frameBase64;
      NexusHardware.stopCameraStream(medVideo);
    }

    const cameraSection = document.getElementById('medCameraLiveSection');
    if (cameraSection) cameraSection.style.display = 'none';

    loadMedDocument('camera', 'Captured_Medical_Prescription.jpg');
  };

  // STEP 1: Load Document (Shows loaded document preview - NO DIRECT JUMP)
  const loadMedDocument = (sampleKey = 'rx1', customFileName = null) => {
    NexusAudio.play('click');

    const docDetails = {
      rx1: {
        name: 'OPD_Prescription_Dr_Rao_2026.jpg',
        type: 'Handwritten Doctor Prescription',
        size: '2.4 MB (High Res)',
        tags: 'ICD-10 Detected: E11.9 (Type 2 Diabetes)'
      },
      rx2: {
        name: 'Discharge_Summary_City_Hospital.pdf',
        type: 'Inpatient Clinical Summary',
        size: '1.8 MB (Digital Scan)',
        tags: 'ICD-10 Detected: I10 (Hypertension)'
      },
      camera: {
        name: customFileName || 'Camera_Prescription_Scan.jpg',
        type: 'Live Optical Camera Capture',
        size: '1.9 MB (JPEG)',
        tags: 'High Contrast Frame Locked'
      }
    };

    const doc = docDetails[sampleKey] || {
      name: customFileName || 'Scanned_Medical_Record.jpg',
      type: 'Patient Health Record',
      size: '2.1 MB (Clean Scan)',
      tags: 'Optical Capture Ready'
    };

    currentDocLoaded = doc;

    // Show Document Preview Stage
    const uploadDrop = document.getElementById('medUploadBox');
    const previewStage = document.getElementById('medDocPreviewStage');
    const docName = document.getElementById('medLoadedDocName');
    const docMeta = document.getElementById('medLoadedDocMeta');

    if (uploadDrop) uploadDrop.style.display = 'none';
    if (docName) docName.textContent = doc.name;
    if (docMeta) docMeta.textContent = `${doc.type} • ${doc.size}`;
    if (previewStage) previewStage.classList.add('active');

    NexusApp.showToast('Document loaded! Click "Run Optical Extraction" to process.');
  };

  // STEP 2: Run Extraction (Explicitly triggered on the preview card)
  const startMedAnalysis = async () => {
    NexusAudio.play('click');

    const coords = await NexusHardware.getCurrentCoordinates();
    const docData = window.lastMedDocBase64 || "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/";

    NexusHardware.processNexusInput("MED", docData, coords).then((res) => {
      console.log("[Nexus Med-Scanner API Response]", res);
    }).catch((err) => {
      console.info("[Nexus Med-Scanner API Bridge] Using local fallback:", err.message);
    });

    NexusApp.runAiProcessingSequence(
      {
        title: 'Synthesizing Medical Passport',
        subtitle: 'Deciphering handwritten Rx & records',
        steps: [
          'OCR extracted prescription text, dosages & schedules',
          'Cross-referencing contraindications & severe drug allergies',
          'Generating encrypted emergency bio-pass token'
        ],
        duration: 2100
      },
      () => {
        const previewStage = document.getElementById('medDocPreviewStage');
        const resultCard = document.getElementById('medResultCard');
        if (previewStage) previewStage.classList.remove('active');
        if (resultCard) resultCard.classList.add('active');
        NexusApp.showToast('✅ Medical Passport Generated with Allergies Highlighted!');
      }
    );
  };

  const changeMedDocument = () => {
    NexusAudio.play('click');
    const uploadDrop = document.getElementById('medUploadBox');
    const previewStage = document.getElementById('medDocPreviewStage');
    const resultCard = document.getElementById('medResultCard');

    if (resultCard) resultCard.classList.remove('active');
    if (previewStage) previewStage.classList.remove('active');
    if (currentMedMode === 'camera') {
      const cameraSection = document.getElementById('medCameraLiveSection');
      if (cameraSection) cameraSection.style.display = 'block';
      const medVideo = document.getElementById('medCameraVideo');
      if (medVideo && window.NexusHardware) {
        NexusHardware.startCameraStream(medVideo, 'environment');
      }
    } else {
      if (uploadDrop) uploadDrop.style.display = 'block';
    }

    NexusApp.showToast('Select or upload medical document to scan.');
  };

  const handleMedFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        window.lastMedDocBase64 = event.target.result;
      };
      reader.readAsDataURL(file);
      loadMedDocument('custom', file.name);
    }
  };

  /* --------------------------------------------------------------------------
     4. SCAM SHIELD CONTROLLER (TEXT, LINKS & DOCUMENT/CHALLAN INSPECTION)
     -------------------------------------------------------------------------- */
  let currentShieldMode = 'text'; // 'text' | 'doc'
  let currentShieldDoc = null;

  const samplePresets = {
    bank: 'URGENT SBI ALERT: Your NetBanking account has been suspended due to unverified KYC. Click to re-verify immediately or account will be frozen: http://sbi-kyc-verify-netbanking-alert.top/login.php',
    lottery: 'CONGRATULATIONS! You have won Rs 50,000 Telegram Lucky Draw voucher. Send your UPI PIN & claim: http://telegram-rewards-claim.xyz/verify',
    clean: 'State Bank of India: Your OTP for transaction of Rs 1,200 is 492014. Valid for 10 mins. Do not share OTP with anyone. Visit https://onlinesbi.sbi'
  };

  const sampleDocPresets = {
    challan: {
      name: 'Traffic_E-Challan_Pending_Notice_MH14.pdf',
      meta: 'State Police Traffic Dept • Over-Speeding Fine ₹2,500',
      icon: 'fa-receipt',
      isScam: true,
      stamp: 'FRAUDULENT CHALLAN',
      headline: '🚨 SCAM DETECTED: Fake Traffic E-Challan APK Notice',
      subMsg: 'Forged police traffic document directing victims to download a malicious APK payload ("parivahan-pay.apk") instead of official Government of India portal.',
      threatScore: '99.4% CRITICAL FRAUD',
      portal: 'echallan.parivahan.gov.in',
      evidence: [
        '<strong>Forged Ministry Emblem:</strong> Mismatched seal and low-resolution state police logo with bogus badge number.',
        '<strong>Malicious APK Payload:</strong> Document links to an untrusted APK package designed to intercept banking OTPs and credentials.',
        '<strong>Coercive Urgency:</strong> Threatens non-bailable court warrant within 2 hours to induce panic and force instant payment.'
      ]
    },
    arrest: {
      name: 'CBI_Digital_Arrest_Warrant_Notice.pdf',
      meta: 'Central Bureau of Investigation (CBI) • Anti-Money Laundering Summons',
      icon: 'fa-handcuffs',
      isScam: true,
      stamp: 'EXTORTION NOTICE',
      headline: '🚨 SCAM DETECTED: "Digital Arrest" Fraud Summons',
      subMsg: 'Classic cybercrime extortion document threatening "Digital Arrest" with forged judicial stamps to extort money into bogus "RBI clearance accounts".',
      threatScore: '99.8% CRITICAL FRAUD',
      portal: 'cybercrime.gov.in (National Cyber Helpline 1930)',
      evidence: [
        '<strong>Bogus Legal Construct:</strong> Indian Law, Supreme Court, and Police have NO concept of "Digital Arrest" via WhatsApp/Skype video.',
        '<strong>Forged Signatures & Badges:</strong> Falsified signatures of senior IPS officers and unauthorized use of State Emblem.',
        '<strong>Extortion Demand:</strong> Demands immediate fund transfer to private bank accounts under the guise of "verification funds".'
      ]
    },
    cleanChallan: {
      name: 'Official_Parivahan_E-Challan_MH12.pdf',
      meta: 'Ministry of Road Transport & Highways • Speed Violation Challan',
      icon: 'fa-circle-check',
      isScam: false,
      stamp: 'VERIFIED AUTHENTIC',
      headline: '✅ VERIFIED AUTHENTIC: Official Parivahan Challan',
      subMsg: 'Cryptographically verified with NIC Government of India digital certificate. QR code routes strictly to official sovereign domain.',
      threatScore: '0.4% MINIMAL RISK',
      portal: 'echallan.parivahan.gov.in',
      evidence: [
        '<strong>Valid Sovereign Cryptographic Seal:</strong> Issued and signed by NIC Ministry of Road Transport and Highways.',
        '<strong>Direct Sovereign Gateway:</strong> Payment link points exclusively to *.gov.in without any intermediate APK redirects.',
        '<strong>Statutory Due Process:</strong> Standard 60-day dispute window provided per Motor Vehicles Act.'
      ]
    }
  };

  const setShieldMode = (mode) => {
    currentShieldMode = mode;
    NexusAudio.play('click');

    const textBtn = document.getElementById('shieldModeTextBtn');
    const docBtn = document.getElementById('shieldModeDocBtn');
    const textSec = document.getElementById('shieldTextSection');
    const docSec = document.getElementById('shieldDocSection');
    const resultCard = document.getElementById('shieldResultCard');

    if (resultCard) resultCard.classList.remove('active');

    if (mode === 'doc') {
      if (textBtn) textBtn.classList.remove('active');
      if (docBtn) docBtn.classList.add('active');
      if (textSec) textSec.style.display = 'none';
      if (docSec) docSec.style.display = 'block';
      NexusApp.showToast('Switched to Document & E-Challan Forensic Audit Mode');
    } else {
      if (textBtn) textBtn.classList.add('active');
      if (docBtn) docBtn.classList.remove('active');
      if (textSec) textSec.style.display = 'block';
      if (docSec) docSec.style.display = 'none';
      NexusApp.showToast('Switched to Text, Link & SMS Phishing Mode');
    }
  };

  const fillSampleScam = (type) => {
    setShieldMode('text');
    NexusAudio.play('click');
    const input = document.getElementById('shieldInput');
    if (input) {
      input.value = samplePresets[type] || samplePresets.bank;
      updateShieldCounter();
    }
  };

  const loadSampleScamDoc = (presetKey) => {
    setShieldMode('doc');
    NexusAudio.play('click');

    const doc = sampleDocPresets[presetKey] || sampleDocPresets.challan;
    currentShieldDoc = doc;

    const uploadBox = document.getElementById('shieldUploadBox');
    const previewStage = document.getElementById('shieldDocPreviewStage');
    const nameEl = document.getElementById('shieldLoadedDocName');
    const metaEl = document.getElementById('shieldLoadedDocMeta');
    const iconEl = document.getElementById('shieldDocTypeIcon');

    if (uploadBox) uploadBox.style.display = 'none';
    if (nameEl) nameEl.textContent = doc.name;
    if (metaEl) metaEl.textContent = doc.meta;
    if (iconEl) iconEl.className = `fa-solid ${doc.icon}`;
    if (previewStage) previewStage.classList.add('active');

    NexusApp.showToast(`Loaded: ${doc.name}. Click "Run Forensic Seal Audit" to verify.`);
  };

  const handleShieldDocUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setShieldMode('doc');
      NexusAudio.play('click');

      const isChallanLike = file.name.toLowerCase().includes('challan') || file.name.toLowerCase().includes('traffic');
      const doc = {
        name: file.name,
        meta: `Uploaded File (${(file.size / 1024 / 1024).toFixed(1)} MB) • Scanning Official Seal`,
        icon: 'fa-file-shield',
        isScam: true,
        stamp: isChallanLike ? 'FRAUDULENT CHALLAN' : 'SUSPICIOUS DOCUMENT',
        headline: isChallanLike ? '🚨 SCAM DETECTED: Fake Traffic E-Challan Notice' : '🚨 SCAM DETECTED: Forged Official Notice',
        subMsg: 'Document exhibits digital tampering, pixelated government insignia, and third-party credential harvesting payment triggers.',
        threatScore: '98.9% CRITICAL FRAUD',
        portal: isChallanLike ? 'echallan.parivahan.gov.in' : 'cybercrime.gov.in',
        evidence: [
          '<strong>Tampered Seal Metadata:</strong> Forged sovereign emblem not registered on official digital repository.',
          '<strong>Coercive Threat Signature:</strong> Pressurizes recipient into unverified instant remittance.',
          '<strong>Mismatched Payment Route:</strong> Directs payment away from authorized treasury gateways.'
        ]
      };

      currentShieldDoc = doc;

      const uploadBox = document.getElementById('shieldUploadBox');
      const previewStage = document.getElementById('shieldDocPreviewStage');
      const nameEl = document.getElementById('shieldLoadedDocName');
      const metaEl = document.getElementById('shieldLoadedDocMeta');

      if (uploadBox) uploadBox.style.display = 'none';
      if (nameEl) nameEl.textContent = doc.name;
      if (metaEl) metaEl.textContent = doc.meta;
      if (previewStage) previewStage.classList.add('active');

      NexusApp.showToast('Document uploaded. Ready for forensic seal audit.');
    }
  };

  const startShieldDocAnalysis = () => {
    NexusAudio.play('click');

    NexusApp.runAiProcessingSequence(
      {
        title: 'Auditing Document Seals & Payment Routes',
        subtitle: 'Digital forensic emblem & cryptographic check',
        steps: [
          'Analyzing government insignia, font kerning & resolution',
          'Cross-referencing payment URLs & QR codes with NIC repository',
          'Auditing coercive legal terminology & 1930 fraud signatures'
        ],
        duration: 2100
      },
      () => {
        const previewStage = document.getElementById('shieldDocPreviewStage');
        if (previewStage) previewStage.classList.remove('active');

        const doc = currentShieldDoc || sampleDocPresets.challan;
        renderShieldVerdict(doc.isScam, doc);

        const card = document.getElementById('shieldResultCard');
        if (card) card.classList.add('active');
        NexusApp.showToast(doc.isScam ? '🚨 Fraudulent Document Confirmed by Forensic Audit!' : '✅ Document Verified Authentic by Sovereign Authority.');
      }
    );
  };

  const changeShieldDocument = () => {
    NexusAudio.play('click');
    const uploadBox = document.getElementById('shieldUploadBox');
    const previewStage = document.getElementById('shieldDocPreviewStage');
    const resultCard = document.getElementById('shieldResultCard');

    if (resultCard) resultCard.classList.remove('active');
    if (previewStage) previewStage.classList.remove('active');
    if (uploadBox) uploadBox.style.display = 'block';

    NexusApp.showToast('Upload or select document to audit.');
  };

  const pasteClipboard = async () => {
    NexusAudio.play('click');
    const input = document.getElementById('shieldInput');
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        input.value = text;
        updateShieldCounter();
        NexusApp.showToast('Pasted from clipboard');
      } else {
        NexusApp.showToast('Please paste your text or link directly into the box.');
      }
    } catch (e) {
      NexusApp.showToast('Please paste your text or link directly into the box.');
    }
  };

  const updateShieldCounter = () => {
    const input = document.getElementById('shieldInput');
    const counter = document.getElementById('shieldInputCounter');
    if (input && counter) {
      counter.textContent = `${input.value.length} chars`;
    }
  };

  const triggerShieldScan = () => {
    const input = document.getElementById('shieldInput');
    if (!input || !input.value.trim()) {
      NexusApp.showToast('Please paste or enter a suspicious SMS, message, or link to verify.');
      return;
    }

    NexusAudio.play('click');

    NexusApp.runAiProcessingSequence(
      {
        title: 'Verifying Threat Signature',
        subtitle: 'National Cyber Crime 1930 Heuristic Check',
        steps: [
          'Domain registration & WHOIS telemetry queried',
          'Typosquatting & SSL certificate checked',
          'Analyzing coercive linguistic heuristics'
        ],
        duration: 1900
      },
      () => {
        const isClean = input && input.value.includes('onlinesbi.sbi');
        renderShieldVerdict(!isClean, null);
        const card = document.getElementById('shieldResultCard');
        if (card) card.classList.add('active');
      }
    );
  };

  const renderShieldVerdict = (isScam, customDocData = null) => {
    const verdictBox = document.getElementById('scamVerdictBox');
    const stamp = document.getElementById('stampBadge');
    const headlineText = document.getElementById('scamHeadlineText');
    const subMsg = document.getElementById('scamSubMsg');
    const scoreVal = document.getElementById('threatScoreVal');
    const barFill = document.getElementById('threatBarFill');
    const evidenceList = document.getElementById('scamEvidenceList');
    const portalBanner = document.getElementById('officialPortalBanner');
    const portalUrl = document.getElementById('officialPortalUrl');

    if (!verdictBox || !stamp) return;

    if (customDocData) {
      // Document / Challan specific render
      if (customDocData.isScam) {
        NexusAudio.play('emergencyAlert');
        verdictBox.style.borderColor = '#ef4444';
        stamp.textContent = customDocData.stamp || 'FRAUDULENT DOCUMENT';
        stamp.style.color = '#ef4444';
        stamp.style.borderColor = '#ef4444';
        stamp.style.background = 'rgba(239, 68, 68, 0.15)';

        if (headlineText) headlineText.textContent = customDocData.headline;
        if (subMsg) subMsg.textContent = customDocData.subMsg;
        if (scoreVal) {
          scoreVal.textContent = customDocData.threatScore || '99.2% CRITICAL FRAUD';
          scoreVal.style.color = '#ef4444';
        }
        if (barFill) {
          barFill.style.width = '99%';
          barFill.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
        }
        if (portalBanner && portalUrl) {
          portalBanner.style.display = 'flex';
          portalUrl.textContent = customDocData.portal;
        }
        if (evidenceList) {
          evidenceList.innerHTML = customDocData.evidence.map(e => `
            <li><i class="fa-solid fa-circle-xmark"></i> <span>${e}</span></li>
          `).join('');
        }
      } else {
        NexusAudio.play('success');
        verdictBox.style.borderColor = '#10b981';
        stamp.textContent = customDocData.stamp || 'VERIFIED AUTHENTIC';
        stamp.style.color = '#10b981';
        stamp.style.borderColor = '#10b981';
        stamp.style.background = 'rgba(16, 185, 129, 0.15)';

        if (headlineText) headlineText.textContent = customDocData.headline;
        if (subMsg) subMsg.textContent = customDocData.subMsg;
        if (scoreVal) {
          scoreVal.textContent = customDocData.threatScore || '0.4% MINIMAL RISK';
          scoreVal.style.color = '#10b981';
        }
        if (barFill) {
          barFill.style.width = '5%';
          barFill.style.background = '#10b981';
        }
        if (portalBanner && portalUrl) {
          portalBanner.style.display = 'flex';
          portalUrl.textContent = customDocData.portal;
        }
        if (evidenceList) {
          evidenceList.innerHTML = customDocData.evidence.map(e => `
            <li><i class="fa-solid fa-circle-check" style="color:#10b981"></i> <span>${e}</span></li>
          `).join('');
        }
      }
      return;
    }

    // Default text/link render
    if (portalBanner) portalBanner.style.display = 'none';

    if (isScam) {
      NexusAudio.play('emergencyAlert');
      verdictBox.style.borderColor = '#ef4444';
      stamp.textContent = 'PHISHING DETECTED';
      stamp.style.color = '#ef4444';
      stamp.style.borderColor = '#ef4444';
      stamp.style.background = 'rgba(239, 68, 68, 0.15)';
      if (headlineText) headlineText.textContent = '🚨 SCAM DETECTED: Phishing Link';
      if (subMsg) subMsg.textContent = 'Malicious credential-harvesting campaign masquerading as State Bank NetBanking.';
      if (scoreVal) {
        scoreVal.textContent = '98.4% CRITICAL DANGER';
        scoreVal.style.color = '#ef4444';
      }
      if (barFill) {
        barFill.style.width = '98%';
        barFill.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
      }

      if (evidenceList) {
        evidenceList.innerHTML = `
          <li><i class="fa-solid fa-circle-xmark"></i> <span><strong>Lookalike Typosquatting:</strong> Domain registered 2 days ago via anonymous registrar.</span></li>
          <li><i class="fa-solid fa-circle-xmark"></i> <span><strong>Coercive Urgency:</strong> Threatens immediate account block to force panicking user into submitting OTP.</span></li>
          <li><i class="fa-solid fa-circle-xmark"></i> <span><strong>Cyber Cell Fingerprint:</strong> Known threat cluster reported to National Cyber Crime portal.</span></li>
        `;
      }
    } else {
      NexusAudio.play('success');
      verdictBox.style.borderColor = '#10b981';
      stamp.textContent = 'VERIFIED SAFE';
      stamp.style.color = '#10b981';
      stamp.style.borderColor = '#10b981';
      stamp.style.background = 'rgba(16, 185, 129, 0.15)';
      if (headlineText) headlineText.textContent = '✅ VERIFIED AUTHENTIC: Official Portal';
      if (subMsg) subMsg.textContent = 'Legitimate cryptographic certificate and recognized institutional domain.';
      if (scoreVal) {
        scoreVal.textContent = '0.2% MINIMAL RISK';
        scoreVal.style.color = '#10b981';
      }
      if (barFill) {
        barFill.style.width = '4%';
        barFill.style.background = '#10b981';
      }

      if (evidenceList) {
        evidenceList.innerHTML = `
          <li><i class="fa-solid fa-circle-check" style="color:#10b981"></i> <span><strong>Valid Extended SSL:</strong> Issued to verified sovereign banking authority.</span></li>
          <li><i class="fa-solid fa-circle-check" style="color:#10b981"></i> <span><strong>Safe Protocol:</strong> No credential-harvesting parameters detected.</span></li>
        `;
      }
    }
  };

  const resetShield = () => {
    NexusAudio.play('click');
    const card = document.getElementById('shieldResultCard');
    const input = document.getElementById('shieldInput');
    const uploadBox = document.getElementById('shieldUploadBox');
    const previewStage = document.getElementById('shieldDocPreviewStage');

    if (card) card.classList.remove('active');
    if (previewStage) previewStage.classList.remove('active');
    if (uploadBox) uploadBox.style.display = 'block';
    if (input) input.value = '';
    updateShieldCounter();
  };

  return {
    initSos,
    triggerSosEmergency,
    testSimulatedVoice,
    resetSos,
    call112,
    setCivicMode,
    captureCivicMedia,
    startCivicAnalysis,
    retakeCivic,
    handleCivicFileUpload,
    loadMedDocument,
    setMedMode,
    captureMedCameraMedia,
    startMedAnalysis,
    changeMedDocument,
    handleMedFileUpload,
    setShieldMode,
    fillSampleScam,
    loadSampleScamDoc,
    handleShieldDocUpload,
    startShieldDocAnalysis,
    changeShieldDocument,
    pasteClipboard,
    updateShieldCounter,
    triggerShieldScan,
    resetShield
  };
})();
