/**
 * ==============================================================================
 * NEXUS VALIDATOR & CIVIC INTELLIGENCE ENGINE UTILITIES
 * Pure JavaScript • Isomorphic (Runs in Browser & Node.js test suite)
 * Handles deterministic priority scoring, duplicate detection, schema validation,
 * input sanitization, and file constraints.
 * ==============================================================================
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    // Node.js / CommonJS
    module.exports = factory();
  } else {
    // Browser global
    root.NexusValidator = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* --------------------------------------------------------------------------
     1. XSS SANITIZATION & SAFE STRING ESCAPING
     -------------------------------------------------------------------------- */
  /**
   * Safely escapes HTML special characters to prevent XSS injection
   * @param {string} str
   * @returns {string}
   */
  const escapeHtml = (str) => {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  /* --------------------------------------------------------------------------
     2. INPUT VALIDATION
     -------------------------------------------------------------------------- */
  /**
   * Validates civic report title and description
   * @param {string} title
   * @param {string} description
   * @returns {{isValid: boolean, errors: string[]}}
   */
  const validateCivicReportInput = (title, description) => {
    const errors = [];
    if (!title || typeof title !== "string" || !title.trim()) {
      errors.push("Report title is required.");
    } else if (title.trim().length < 3) {
      errors.push("Report title must be at least 3 characters.");
    } else if (title.length > 150) {
      errors.push("Report title cannot exceed 150 characters.");
    }

    if (description && typeof description === "string" && description.length > 2000) {
      errors.push("Description cannot exceed 2000 characters.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  /**
   * Validates latitude and longitude coordinates
   * @param {number|string} lat
   * @param {number|string} lng
   * @returns {boolean}
   */
  const validateCoordinates = (lat, lng) => {
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (isNaN(latitude) || isNaN(longitude)) return false;
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  };

  /**
   * Validates file upload for size and allowed MIME types
   * @param {{size: number, type: string}} file
   * @param {number} maxSizeBytes - Default 10MB
   * @returns {{isValid: boolean, error: string|null}}
   */
  const validateUploadedFile = (file, maxSizeBytes = 10 * 1024 * 1024) => {
    if (!file) return { isValid: false, error: "No file provided." };

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf"
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type || "unknown"}. Allowed formats: JPG, PNG, WEBP, PDF.`
      };
    }

    if (file.size > maxSizeBytes) {
      const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      return {
        isValid: false,
        error: `File size exceeds ${maxMb}MB limit. Uploaded file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
      };
    }

    return { isValid: true, error: null };
  };

  /* --------------------------------------------------------------------------
     3. DETERMINISTIC PRIORITY SCORING (0 - 100)
     Formula Weights:
       - Safety Impact: 0 - 35 points
       - Severity Level: 0 - 25 points
       - Duplicate / Incident Cluster Count: 0 - 15 points
       - Recency / Time Urgency: 0 - 15 points
       - Evidence Quality (Verified GPS, Image attached): 0 - 10 points
     -------------------------------------------------------------------------- */
  const PRIORITY_WEIGHTS = {
    safetyImpactMax: 35,
    severityMax: 25,
    duplicateClusterMax: 15,
    recencyMax: 15,
    evidenceQualityMax: 10
  };

  /**
   * Computes a reproducible, explainable priority score (0 - 100)
   * @param {Object} params
   * @param {string} params.severity - "CRITICAL" | "HIGH" | "MODERATE" | "LOW"
   * @param {string} params.category - "pothole" | "electrical" | "drainage" | "waste" | "streetlight" | etc.
   * @param {number} [params.duplicateCount=0] - Number of matching reports in proximity
   * @param {number} [params.ageHours=0] - Hours elapsed since report creation
   * @param {boolean} [params.hasImage=false] - Whether media evidence is provided
   * @param {boolean} [params.hasVerifiedLocation=false] - Whether GPS location is verified
   * @returns {{score: number, level: string, breakdown: Object}}
   */
  const calculatePriorityScore = ({
    severity = "MODERATE",
    category = "pothole",
    duplicateCount = 0,
    ageHours = 0,
    hasImage = false,
    hasVerifiedLocation = false
  } = {}) => {
    // 1. Safety Impact (0 - 35) based on hazard category
    const categoryRisk = {
      electrical: 35, // Exposed wires, downed cables = immediate fatal risk
      open_manhole: 33, // Severe pedestrian/vehicular fall hazard
      road_damage: 28, // High-speed traffic hazard
      pothole: 26,     // Two-wheeler skid / vehicle damage
      drainage: 20,    // Flooding / sewage overflow
      water_leakage: 18,
      waste: 14,       // Sanitation / hygiene
      streetlight: 12, // Darkness / night safety
      other: 10
    };
    const normCategory = (category || "").toLowerCase().replace(/[\s-]/g, "_");
    const safetyImpactScore = categoryRisk[normCategory] || 15;

    // 2. Severity Level (0 - 25)
    const severityPoints = {
      CRITICAL: 25,
      HIGH: 19,
      MODERATE: 12,
      LOW: 6
    };
    const normSeverity = (severity || "").toUpperCase().trim();
    const severityScore = severityPoints[normSeverity] || 12;

    // 3. Duplicate / Cluster Velocity (0 - 15)
    // 0 duplicates = 0 pts; 1 dup = 5 pts; 2 dups = 10 pts; 3+ dups = 15 pts
    const duplicateScore = Math.min(15, Math.max(0, duplicateCount * 5));

    // 4. Time Elapsed Urgency (0 - 15)
    // Recent unresolved issues gain escalation urgency over time
    // 0-6 hrs = 4 pts; 6-24 hrs = 8 pts; 24-48 hrs = 12 pts; >48 hrs = 15 pts
    let recencyScore = 4;
    if (ageHours > 48) {
      recencyScore = 15;
    } else if (ageHours > 24) {
      recencyScore = 12;
    } else if (ageHours > 6) {
      recencyScore = 8;
    }

    // 5. Evidence Quality (0 - 10)
    let evidenceScore = 0;
    if (hasImage) evidenceScore += 5;
    if (hasVerifiedLocation) evidenceScore += 5;

    // Total Score (Clamped 0 - 100)
    const rawTotal = safetyImpactScore + severityScore + duplicateScore + recencyScore + evidenceScore;
    const score = Math.min(100, Math.max(0, Math.round(rawTotal)));

    // Categorical Priority Level
    let level = "LOW";
    if (score >= 80) level = "CRITICAL";
    else if (score >= 60) level = "HIGH";
    else if (score >= 40) level = "MODERATE";

    return {
      score,
      level,
      breakdown: {
        safetyImpact: { points: safetyImpactScore, max: PRIORITY_WEIGHTS.safetyImpactMax, category: normCategory },
        severity: { points: severityScore, max: PRIORITY_WEIGHTS.severityMax, severity: normSeverity },
        duplicateCluster: { points: duplicateScore, max: PRIORITY_WEIGHTS.duplicateClusterMax, count: duplicateCount },
        timeUrgency: { points: recencyScore, max: PRIORITY_WEIGHTS.recencyMax, ageHours },
        evidenceQuality: { points: evidenceScore, max: PRIORITY_WEIGHTS.evidenceQualityMax, hasImage, hasVerifiedLocation }
      }
    };
  };

  /* --------------------------------------------------------------------------
     4. GEOGRAPHIC HAVERSINE DISTANCE (KM & METERS)
     -------------------------------------------------------------------------- */
  /**
   * Calculates geodesic distance between two latitude/longitude points in meters
   * @param {number} lat1
   * @param {number} lon1
   * @param {number} lat2
   * @param {number} lon2
   * @returns {number} Distance in meters
   */
  const calculateHaversineDistanceMeters = (lat1, lon1, lat2, lon2) => {
    if (!validateCoordinates(lat1, lon1) || !validateCoordinates(lat2, lon2)) {
      return Infinity;
    }
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  /* --------------------------------------------------------------------------
     5. TEXT TOKEN SIMILARITY (JACCARD COEFFICIENT)
     -------------------------------------------------------------------------- */
  /**
   * Tokenizes text into lowercase word tokens, ignoring common punctuation
   * @param {string} text
   * @returns {Set<string>}
   */
  const tokenize = (text) => {
    if (!text || typeof text !== "string") return new Set();
    const clean = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .trim();
    const words = clean.split(/\s+/).filter((w) => w.length > 2);
    return new Set(words);
  };

  /**
   * Computes Jaccard word-similarity coefficient between two text strings (0.0 to 1.0)
   * @param {string} strA
   * @param {string} strB
   * @returns {number}
   */
  const calculateTextSimilarity = (strA, strB) => {
    const tokensA = tokenize(strA);
    const tokensB = tokenize(strB);

    if (tokensA.size === 0 && tokensB.size === 0) return 1.0;
    if (tokensA.size === 0 || tokensB.size === 0) return 0.0;

    let intersectionCount = 0;
    for (const token of tokensA) {
      if (tokensB.has(token)) {
        intersectionCount++;
      }
    }

    const unionCount = tokensA.size + tokensB.size - intersectionCount;
    return unionCount === 0 ? 0 : parseFloat((intersectionCount / unionCount).toFixed(3));
  };

  /* --------------------------------------------------------------------------
     6. DUPLICATE INCIDENT MATCHER
     Signals:
       - Category Exact Match (30%)
       - Text Similarity >= 0.4 (40%)
       - Spatial Proximity <= 150 meters (30%)
     -------------------------------------------------------------------------- */
  /**
   * Finds matching duplicate candidates from an existing list of civic reports
   * @param {Object} candidate - { title, description, category, location: { latitude, longitude } }
   * @param {Array<Object>} existingReports
   * @param {number} [threshold=0.60] - Minimum composite score to flag as potential duplicate
   * @returns {Array<{report: Object, similarityScore: number, reasons: string[]}>}
   */
  const findDuplicateCandidates = (candidate, existingReports = [], threshold = 0.60) => {
    if (!candidate || !Array.isArray(existingReports) || existingReports.length === 0) {
      return [];
    }

    const matches = [];

    for (const report of existingReports) {
      // Don't compare a report to itself
      if (report.id && candidate.id && report.id === candidate.id) continue;

      let score = 0;
      const reasons = [];

      // 1. Category match
      const catA = (candidate.category || "").toLowerCase();
      const catB = (report.category || "").toLowerCase();
      if (catA && catB && catA === catB) {
        score += 0.30;
        reasons.push(`Matching category: ${catA}`);
      }

      // 2. Text similarity (Title + Description)
      const textA = `${candidate.title || ""} ${candidate.description || ""}`;
      const textB = `${report.title || ""} ${report.description || ""}`;
      const textSim = calculateTextSimilarity(textA, textB);
      if (textSim >= 0.3) {
        score += textSim * 0.40;
        reasons.push(`Text description overlap: ${Math.round(textSim * 100)}%`);
      }

      // 3. Geographic proximity (if both have coordinates)
      const locA = candidate.location;
      const locB = report.location;
      if (locA && locB && locA.latitude && locB.latitude) {
        const distanceM = calculateHaversineDistanceMeters(
          locA.latitude,
          locA.longitude,
          locB.latitude,
          locB.longitude
        );
        if (distanceM <= 150) {
          // Extremely close proximity (within 150m)
          const proximityWeight = Math.max(0, 0.30 * (1 - distanceM / 150));
          score += proximityWeight;
          reasons.push(`Geographic proximity: ~${distanceM}m away`);
        }
      }

      score = Math.min(1.0, parseFloat(score.toFixed(3)));

      if (score >= threshold) {
        matches.push({
          report,
          similarityScore: score,
          reasons
        });
      }
    }

    // Sort highest similarity first
    return matches.sort((a, b) => b.similarityScore - a.similarityScore);
  };

  /* --------------------------------------------------------------------------
     7. STRICT SCHEMA VALIDATOR (CIVIC, MED, SCAM)
     -------------------------------------------------------------------------- */
  /**
   * Validates structured AI output for Civic Action
   * @param {Object} data
   * @returns {{isValid: boolean, validatedData: Object, errors: string[]}}
   */
  const validateCivicSchema = (data) => {
    const errors = [];
    if (!data || typeof data !== "object") {
      return { isValid: false, validatedData: null, errors: ["Payload must be a non-empty object."] };
    }

    const validSeverities = ["CRITICAL", "HIGH", "MODERATE", "LOW"];
    const severity = (data.severity || "MODERATE").toUpperCase();
    if (!validSeverities.includes(severity)) {
      errors.push(`Invalid severity '${data.severity}'. Allowed: ${validSeverities.join(", ")}`);
    }

    const validatedData = {
      issue: typeof data.issue === "string" ? escapeHtml(data.issue) : "Civic Infrastructure Hazard",
      severity: validSeverities.includes(severity) ? severity : "MODERATE",
      estimatedDepthOrDimension: typeof data.estimatedDepthOrDimension === "string" ? escapeHtml(data.estimatedDepthOrDimension) : "Dimension pending site verification",
      hazardCategory: typeof data.hazardCategory === "string" ? escapeHtml(data.hazardCategory) : "Public Safety",
      jurisdiction: typeof data.jurisdiction === "string" ? escapeHtml(data.jurisdiction) : "Municipal Public Works Department (Suggested)",
      slaTargetHours: typeof data.slaTargetHours === "number" ? data.slaTargetHours : 24,
      safetyRecommendation: typeof data.safetyRecommendation === "string" ? escapeHtml(data.safetyRecommendation) : "Exercise caution in proximity of hazard.",
      isAiVerified: data.isAiVerified !== false
    };

    return {
      isValid: errors.length === 0,
      validatedData,
      errors
    };
  };

  /**
   * Validates structured AI output for Med-Scanner
   * @param {Object} data
   * @returns {{isValid: boolean, validatedData: Object, errors: string[]}}
   */
  const validateMedSchema = (data) => {
    if (!data || typeof data !== "object") {
      return { isValid: false, validatedData: null, errors: ["Payload must be a non-empty object."] };
    }

    const allergies = Array.isArray(data.allergies) ? data.allergies : [];
    const medications = Array.isArray(data.currentMedications) ? data.currentMedications : [];

    const validatedData = {
      patientName: typeof data.patientName === "string" ? escapeHtml(data.patientName) : "Anonymous Citizen",
      bloodGroup: typeof data.bloodGroup === "string" ? escapeHtml(data.bloodGroup) : "Record Not Specified",
      allergies: allergies.map((a) => ({
        substance: escapeHtml(a.substance || "Unknown Allergen"),
        reaction: escapeHtml(a.reaction || "Adverse Sensitivity"),
        severity: (a.severity || "MODERATE").toUpperCase()
      })),
      currentMedications: medications.map((m) => ({
        name: escapeHtml(m.name || "Medication"),
        dosage: escapeHtml(m.dosage || ""),
        frequency: escapeHtml(m.frequency || "")
      })),
      contraindicationWarning: typeof data.contraindicationWarning === "string" ? escapeHtml(data.contraindicationWarning) : "None explicitly recorded",
      isAiVerified: data.isAiVerified !== false
    };

    return {
      isValid: true,
      validatedData,
      errors: []
    };
  };

  /**
   * Validates structured AI output for Scam Shield
   * @param {Object} data
   * @returns {{isValid: boolean, validatedData: Object, errors: string[]}}
   */
  const validateScamSchema = (data) => {
    if (!data || typeof data !== "object") {
      return { isValid: false, validatedData: null, errors: ["Payload must be a non-empty object."] };
    }

    const rawScore = Number(data.threatScore);
    const threatScore = isNaN(rawScore) ? 50 : Math.min(100, Math.max(0, rawScore));

    const validatedData = {
      isScam: Boolean(data.isScam),
      verdictStamp: typeof data.verdictStamp === "string" ? escapeHtml(data.verdictStamp) : (data.isScam ? "SUSPICIOUS THREAT" : "VERIFIED SAFE"),
      headline: typeof data.headline === "string" ? escapeHtml(data.headline) : "Forensic Audit Completed",
      threatScore,
      threatLevel: typeof data.threatLevel === "string" ? escapeHtml(data.threatLevel) : (threatScore > 75 ? "CRITICAL DANGER" : "MINIMAL RISK"),
      summary: typeof data.summary === "string" ? escapeHtml(data.summary) : "Forensic heuristics completed.",
      evidence: Array.isArray(data.evidence) ? data.evidence.map(escapeHtml) : [],
      officialVerificationPortal: typeof data.officialVerificationPortal === "string" ? escapeHtml(data.officialVerificationPortal) : "cybercrime.gov.in (National Helpline 1930)",
      recommendedAction: typeof data.recommendedAction === "string" ? escapeHtml(data.recommendedAction) : "Review official sovereign portals before initiating any transaction."
    };

    return {
      isValid: true,
      validatedData,
      errors: []
    };
  };

  /* --------------------------------------------------------------------------
     8. EXPORT API
     -------------------------------------------------------------------------- */
  return {
    escapeHtml,
    validateCivicReportInput,
    validateCoordinates,
    validateUploadedFile,
    calculatePriorityScore,
    calculateHaversineDistanceMeters,
    calculateTextSimilarity,
    findDuplicateCandidates,
    validateCivicSchema,
    validateMedSchema,
    validateScamSchema,
    PRIORITY_WEIGHTS
  };
});
