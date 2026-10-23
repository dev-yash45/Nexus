/**
 * ==============================================================================
 * TEST SUITE: CORE CIVIC INTELLIGENCE LOGIC
 * Tests deterministic priority scoring, duplicate detection, input validation,
 * boundary conditions, and spatial proximity.
 * Native Node.js Test Runner (node:test) • Zero external test bloat
 * ==============================================================================
 */

const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const Validator = require("../js/validator.js");

describe("1. Deterministic Priority Scoring", () => {
  test("Score is deterministic and reproducible for identical inputs", () => {
    const input = {
      severity: "CRITICAL",
      category: "pothole",
      duplicateCount: 2,
      ageHours: 12,
      hasImage: true,
      hasVerifiedLocation: true
    };

    const run1 = Validator.calculatePriorityScore(input);
    const run2 = Validator.calculatePriorityScore(input);

    assert.equal(run1.score, run2.score);
    assert.equal(run1.level, run2.level);
    assert.deepEqual(run1.breakdown, run2.breakdown);
  });

  test("Score stays clamped within valid 0 to 100 boundary", () => {
    // Extreme high inputs
    const maxInput = {
      severity: "CRITICAL",
      category: "electrical",
      duplicateCount: 50,
      ageHours: 500,
      hasImage: true,
      hasVerifiedLocation: true
    };
    const maxResult = Validator.calculatePriorityScore(maxInput);
    assert.ok(maxResult.score <= 100, `Score ${maxResult.score} exceeded 100`);
    assert.equal(maxResult.level, "CRITICAL");

    // Extreme low inputs
    const minInput = {
      severity: "LOW",
      category: "other",
      duplicateCount: 0,
      ageHours: 0,
      hasImage: false,
      hasVerifiedLocation: false
    };
    const minResult = Validator.calculatePriorityScore(minInput);
    assert.ok(minResult.score >= 0, `Score ${minResult.score} was below 0`);
  });

  test("High-risk electrical hazards yield higher safety impact than general waste", () => {
    const electrical = Validator.calculatePriorityScore({ category: "electrical", severity: "HIGH" });
    const waste = Validator.calculatePriorityScore({ category: "waste", severity: "HIGH" });

    assert.ok(
      electrical.breakdown.safetyImpact.points > waste.breakdown.safetyImpact.points,
      "Electrical hazard must have higher safety impact weight than waste"
    );
  });

  test("Multiple duplicate reports escalate the priority cluster score", () => {
    const singleReport = Validator.calculatePriorityScore({ duplicateCount: 0 });
    const clusteredReport = Validator.calculatePriorityScore({ duplicateCount: 3 });

    assert.ok(
      clusteredReport.score > singleReport.score,
      "Clustered incidents must receive higher priority than single isolated reports"
    );
    assert.equal(clusteredReport.breakdown.duplicateCluster.points, 15);
  });
});

describe("2. Duplicate Detection & Text Similarity", () => {
  test("Identical text produces similarity score of 1.0", () => {
    const text = "Deep dangerous pothole on MG Road near bus stop";
    const sim = Validator.calculateTextSimilarity(text, text);
    assert.equal(sim, 1.0);
  });

  test("Completely disjoint text produces similarity score of 0.0", () => {
    const textA = "Broken streetlight on avenue";
    const textB = "Overflowing toxic garbage dump";
    const sim = Validator.calculateTextSimilarity(textA, textB);
    assert.equal(sim, 0.0);
  });

  test("Partial overlap detects high-similarity duplicates in same category", () => {
    const candidate = {
      title: "Severe deep pothole on MG road near metro",
      category: "pothole",
      location: { latitude: 18.6272, longitude: 73.8007 }
    };

    const existingReports = [
      {
        id: "rep-1",
        title: "Large pothole on MG road near metro station",
        category: "pothole",
        location: { latitude: 18.6273, longitude: 73.8008 } // ~15 meters away
      },
      {
        id: "rep-2",
        title: "Streetlight not working on Highway 4",
        category: "streetlight",
        location: { latitude: 18.7000, longitude: 73.9000 }
      }
    ];

    const matches = Validator.findDuplicateCandidates(candidate, existingReports, 0.50);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].report.id, "rep-1");
    assert.ok(matches[0].similarityScore >= 0.50);
  });

  test("Report does not match with itself", () => {
    const candidate = { id: "rep-10", title: "Water pipe leaking", category: "water_leakage" };
    const list = [{ id: "rep-10", title: "Water pipe leaking", category: "water_leakage" }];
    const matches = Validator.findDuplicateCandidates(candidate, list);
    assert.equal(matches.length, 0);
  });
});

describe("3. Geographic Haversine Distance", () => {
  test("Calculates accurate distance in meters between known coordinates", () => {
    // Distance between two points ~111 meters apart on meridian
    const lat1 = 18.6272;
    const lon1 = 73.8007;
    const lat2 = 18.6282; // 0.001 deg lat difference ~= 111m
    const lon2 = 73.8007;

    const distanceM = Validator.calculateHaversineDistanceMeters(lat1, lon1, lat2, lon2);
    assert.ok(distanceM >= 105 && distanceM <= 118, `Distance was ${distanceM}m`);
  });

  test("Returns Infinity for invalid or malformed coordinates", () => {
    const dist = Validator.calculateHaversineDistanceMeters("abc", 73.8, 18.6, 73.8);
    assert.equal(dist, Infinity);
  });
});

describe("4. Input & File Constraints Validation", () => {
  test("Validates civic report title bounds", () => {
    assert.equal(Validator.validateCivicReportInput("").isValid, false);
    assert.equal(Validator.validateCivicReportInput("ab").isValid, false); // < 3 chars
    assert.equal(Validator.validateCivicReportInput("Valid Pothole Report").isValid, true);
    assert.equal(Validator.validateCivicReportInput("A".repeat(151)).isValid, false); // > 150 chars
  });

  test("Validates geographic coordinate boundaries", () => {
    assert.equal(Validator.validateCoordinates(18.6272, 73.8007), true);
    assert.equal(Validator.validateCoordinates(91.0, 73.8007), false); // Latitude > 90
    assert.equal(Validator.validateCoordinates(-95.0, 73.8007), false); // Latitude < -90
    assert.equal(Validator.validateCoordinates(18.0, 185.0), false); // Longitude > 180
    assert.equal(Validator.validateCoordinates("invalid", "coords"), false);
  });

  test("Validates file upload type and size restrictions", () => {
    // Valid JPEG under 10MB
    const validFile = { type: "image/jpeg", size: 2 * 1024 * 1024 };
    assert.equal(Validator.validateUploadedFile(validFile).isValid, true);

    // Oversized file > 10MB
    const oversizedFile = { type: "image/png", size: 12 * 1024 * 1024 };
    const sizeResult = Validator.validateUploadedFile(oversizedFile);
    assert.equal(sizeResult.isValid, false);
    assert.match(sizeResult.error, /exceeds 10MB limit/);

    // Unsupported executable file type
    const dangerousFile = { type: "application/x-msdownload", size: 500 };
    const typeResult = Validator.validateUploadedFile(dangerousFile);
    assert.equal(typeResult.isValid, false);
    assert.match(typeResult.error, /Unsupported file type/);
  });
});
