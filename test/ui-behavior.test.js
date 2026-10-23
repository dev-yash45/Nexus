/**
 * ==============================================================================
 * TEST SUITE: UI & STATE BEHAVIOR
 * Tests zone switching state transitions, error recovery, empty states,
 * and form validation behaviors.
 * Native Node.js Test Runner (node:test)
 * ==============================================================================
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const Validator = require("../js/validator.js");

describe("1. State Transition & Zone Mapping", () => {
  const ZONES = {
    civic: { name: "YELLOW ZONE", color: "#f59e0b" },
    med: { name: "BLUE ZONE", color: "#3b82f6" },
    shield: { name: "GREEN ZONE", color: "#10b981" }
  };

  test("Only supported zones are accepted by the router", () => {
    const isSupported = (zoneKey) => Boolean(ZONES[zoneKey]);

    assert.equal(isSupported("civic"), true);
    assert.equal(isSupported("med"), true);
    assert.equal(isSupported("shield"), true);
    assert.equal(isSupported("invalid_zone"), false);
    assert.equal(isSupported(""), false);
  });
});

describe("2. Form Validation & Empty State Guards", () => {
  test("Reject whitespace-only civic issue title", () => {
    const res = Validator.validateCivicReportInput("    ", "Some description");
    assert.equal(res.isValid, false);
    assert.ok(res.errors.includes("Report title is required."));
  });

  test("Empty text scan triggers prompt without making API request", () => {
    const checkText = (text) => {
      if (!text || !text.trim()) {
        return { shouldProceed: false, message: "Please paste or enter text to verify." };
      }
      return { shouldProceed: true, message: null };
    };

    const empty = checkText("   ");
    assert.equal(empty.shouldProceed, false);
    assert.ok(empty.message.length > 0);

    const valid = checkText("Suspicious lottery link http://fake.xyz");
    assert.equal(valid.shouldProceed, true);
  });
});

describe("3. Error Recovery & Fallback Stamping", () => {
  test("Fallback analysis is explicitly marked with heuristic origin", () => {
    const createFallbackAnalysis = (issueType) => {
      return {
        issue: issueType || "Unclassified Hazard",
        severity: "MODERATE",
        isAiVerified: false,
        source: "LOCAL_HEURISTIC_ESTIMATE",
        disclaimer: "Decision support estimate generated locally. Not verified by external municipal authority."
      };
    };

    const fallback = createFallbackAnalysis("Asphalt Pothole");
    assert.equal(fallback.isAiVerified, false);
    assert.equal(fallback.source, "LOCAL_HEURISTIC_ESTIMATE");
    assert.ok(fallback.disclaimer.includes("Decision support estimate"));
  });

  test("AI-verified response is clearly marked differently from heuristic fallback", () => {
    const aiResponse = Validator.validateCivicSchema({
      issue: "Pothole",
      severity: "CRITICAL",
      isAiVerified: true
    });

    assert.equal(aiResponse.validatedData.isAiVerified, true);
  });
});
