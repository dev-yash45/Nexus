/**
 * ==============================================================================
 * TEST SUITE: SCHEMA VALIDATION & XSS SANITIZATION
 * Tests strict schema validation and XSS escaping across all zones
 * Native Node.js Test Runner (node:test)
 * ==============================================================================
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const Validator = require("../js/validator.js");

describe("1. HTML Escaping & XSS Sanitization", () => {
  test("Escapes dangerous script tags and event handlers", () => {
    const malicious = '<script>alert("XSS")</script>';
    const escaped = Validator.escapeHtml(malicious);
    assert.equal(escaped, "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;");
    assert.ok(!escaped.includes("<script>"));
  });

  test("Escapes quotes, ampersands, and angle brackets", () => {
    const input = 'Tom & Jerry said: "Hello" <world>';
    const escaped = Validator.escapeHtml(input);
    assert.equal(escaped, "Tom &amp; Jerry said: &quot;Hello&quot; &lt;world&gt;");
  });

  test("Handles null and undefined safely without throwing", () => {
    assert.equal(Validator.escapeHtml(null), "");
    assert.equal(Validator.escapeHtml(undefined), "");
  });
});

describe("2. Civic AI Schema Validation", () => {
  test("Validates and sanitizes a complete Civic AI response", () => {
    const rawAiResponse = {
      issue: 'Severe Pothole <img src=x onerror=alert(1)>',
      severity: "CRITICAL",
      estimatedDepthOrDimension: "42cm depth",
      hazardCategory: "Road Hazard",
      jurisdiction: "PCMC Ward 14 Public Works Dept",
      slaTargetHours: 24,
      safetyRecommendation: "Cordon off lane and patch surface"
    };

    const result = Validator.validateCivicSchema(rawAiResponse);
    assert.equal(result.isValid, true);
    assert.equal(result.validatedData.severity, "CRITICAL");
    // Verify malicious HTML is stripped/escaped
    assert.ok(!result.validatedData.issue.includes("<img"));
    assert.ok(result.validatedData.issue.includes("&lt;img"));
  });

  test("Applies default fallback values when fields are missing or invalid", () => {
    const emptyResponse = {};
    const result = Validator.validateCivicSchema(emptyResponse);
    assert.equal(result.isValid, true);
    assert.equal(result.validatedData.severity, "MODERATE");
    assert.equal(result.validatedData.slaTargetHours, 24);
    assert.ok(result.validatedData.issue.length > 0);
  });
});

describe("3. Med-Scanner Schema Validation", () => {
  test("Validates patient record with allergies and medications", () => {
    const rawMed = {
      patientName: "Jane Doe",
      bloodGroup: "B+",
      allergies: [
        { substance: "Penicillin", reaction: "Severe Anaphylaxis", severity: "CRITICAL" }
      ],
      currentMedications: [
        { name: "Amoxicillin", dosage: "500mg", frequency: "TID" }
      ],
      contraindicationWarning: "STRICTLY AVOID PENICILLIN"
    };

    const result = Validator.validateMedSchema(rawMed);
    assert.equal(result.isValid, true);
    assert.equal(result.validatedData.patientName, "Jane Doe");
    assert.equal(result.validatedData.allergies.length, 1);
    assert.equal(result.validatedData.allergies[0].severity, "CRITICAL");
  });

  test("Handles empty or null medical payload gracefully", () => {
    const result = Validator.validateMedSchema(null);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.length > 0);
  });
});

describe("4. Scam Shield Schema Validation", () => {
  test("Validates threat analysis and clamps threat score between 0 and 100", () => {
    const rawScam = {
      isScam: true,
      verdictStamp: "FRAUDULENT DOCUMENT",
      headline: "Fake Police Warrant",
      threatScore: 125, // Out of bounds
      evidence: ["<script>bad()</script>", "Forged logo"]
    };

    const result = Validator.validateScamSchema(rawScam);
    assert.equal(result.isValid, true);
    assert.equal(result.validatedData.isScam, true);
    assert.equal(result.validatedData.threatScore, 100); // Clamped to 100
    assert.ok(!result.validatedData.evidence[0].includes("<script>"));
  });
});
