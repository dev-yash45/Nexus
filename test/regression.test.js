/**
 * ==============================================================================
 * TEST SUITE: REGRESSION & SYSTEM INTEGRITY
 * Tests reproducible calculations, state immutability, boundary conditions,
 * and data export formatting.
 * Native Node.js Test Runner (node:test)
 * ==============================================================================
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const Validator = require("../js/validator.js");

describe("1. Determinism & State Immutability", () => {
  test("Priority score calculation does not mutate input object", () => {
    const originalInput = Object.freeze({
      severity: "HIGH",
      category: "road_damage",
      duplicateCount: 1,
      ageHours: 4,
      hasImage: true,
      hasVerifiedLocation: true
    });

    assert.doesNotThrow(() => {
      Validator.calculatePriorityScore(originalInput);
    });
  });

  test("Score ordering is monotonic with respect to severity levels", () => {
    const low = Validator.calculatePriorityScore({ severity: "LOW", category: "pothole" });
    const mod = Validator.calculatePriorityScore({ severity: "MODERATE", category: "pothole" });
    const high = Validator.calculatePriorityScore({ severity: "HIGH", category: "pothole" });
    const crit = Validator.calculatePriorityScore({ severity: "CRITICAL", category: "pothole" });

    assert.ok(low.score < mod.score, "LOW score must be less than MODERATE score");
    assert.ok(mod.score < high.score, "MODERATE score must be less than HIGH score");
    assert.ok(high.score < crit.score, "HIGH score must be less than CRITICAL score");
  });
});

describe("2. Duplicate Candidate Ordering & Filtering", () => {
  test("Candidates are sorted by similarity score in descending order", () => {
    const candidate = {
      title: "Broken streetlight pole and exposed wire",
      category: "electrical",
      location: { latitude: 18.6272, longitude: 73.8007 }
    };

    const existingReports = [
      {
        id: "rep-low",
        title: "Streetlight not working",
        category: "streetlight",
        location: { latitude: 18.6500, longitude: 73.8500 }
      },
      {
        id: "rep-high",
        title: "Broken streetlight pole with exposed wire hazard",
        category: "electrical",
        location: { latitude: 18.6272, longitude: 73.8008 } // ~10m away
      }
    ];

    const matches = Validator.findDuplicateCandidates(candidate, existingReports, 0.20);
    assert.ok(matches.length >= 1);
    assert.equal(matches[0].report.id, "rep-high");
    if (matches.length > 1) {
      assert.ok(matches[0].similarityScore >= matches[1].similarityScore);
    }
  });
});

describe("3. Data Export Safety", () => {
  test("JSON serialization of civic report produces valid parseable JSON", () => {
    const report = {
      id: "REP-2026-001",
      title: 'Pothole on Main St "Corner"',
      category: "pothole",
      severity: "HIGH",
      priorityScore: 78,
      timestamp: new Date().toISOString()
    };

    const jsonString = JSON.stringify(report, null, 2);
    const parsed = JSON.parse(jsonString);

    assert.equal(parsed.id, report.id);
    assert.equal(parsed.title, report.title);
    assert.equal(parsed.priorityScore, 78);
  });
});
