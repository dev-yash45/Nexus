/**
 * ==============================================================================
 * TEST SUITE: SERVERLESS API ENGINE (/api/nexus-engine)
 * Tests HTTP contracts, CORS headers, parameter validation, error paths,
 * and mocked Gemini API responses.
 * Native Node.js Test Runner (node:test)
 * ==============================================================================
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const handler = require("../api/nexus-engine.js");

/**
 * Creates mock HTTP request and response objects for serverless handler testing
 */
function createMockReqRes({ method = "POST", body = {}, headers = {} } = {}) {
  const req = {
    method,
    body,
    headers
  };

  const res = {
    statusCode: 200,
    headers: {},
    ended: false,
    bodyData: null,
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.bodyData = data;
      this.ended = true;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    }
  };

  return { req, res };
}

describe("1. HTTP Contracts & CORS Headers", () => {
  test("OPTIONS preflight returns 200 with standard CORS headers", async () => {
    const { req, res } = createMockReqRes({ method: "OPTIONS" });
    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.ended, true);
    assert.equal(res.headers["access-control-allow-origin"], "*");
    assert.ok(res.headers["access-control-allow-methods"].includes("POST"));
  });

  test("GET request is rejected with 405 Method Not Allowed", async () => {
    const { req, res } = createMockReqRes({ method: "GET" });
    await handler(req, res);

    assert.equal(res.statusCode, 405);
    assert.match(res.bodyData.error, /Method Not Allowed/);
  });
});

describe("2. Request Parameter Validation", () => {
  let originalApiKey;

  beforeEach(() => {
    originalApiKey = process.env.GEMINI_API_KEY;
    // Set a dummy API key so missing key check doesn't trip input validation tests
    process.env.GEMINI_API_KEY = "test_gemini_api_key_123";
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  test("Rejects request missing zoneType with 400 Bad Request", async () => {
    const { req, res } = createMockReqRes({
      method: "POST",
      body: { inputContent: "Dangerous pothole on street" }
    });
    await handler(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.bodyData.error, /Both 'zoneType' .* and 'inputContent' are required/);
  });

  test("Rejects request missing inputContent with 400 Bad Request", async () => {
    const { req, res } = createMockReqRes({
      method: "POST",
      body: { zoneType: "CIVIC" }
    });
    await handler(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.bodyData.error, /Both 'zoneType' .* and 'inputContent' are required/);
  });

  test("Rejects invalid zoneType with 400 Bad Request", async () => {
    const { req, res } = createMockReqRes({
      method: "POST",
      body: { zoneType: "INVALID_ZONE_NAME", inputContent: "Sample report" }
    });
    await handler(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.bodyData.error, /Invalid zoneType/);
  });
});

describe("3. Missing API Key & Error Handling", () => {
  let originalApiKey;

  beforeEach(() => {
    originalApiKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  test("Returns safe 500 JSON error when GEMINI_API_KEY is not configured", async () => {
    const { req, res } = createMockReqRes({
      method: "POST",
      body: { zoneType: "CIVIC", inputContent: "Broken streetlight" }
    });
    await handler(req, res);

    assert.equal(res.statusCode, 500);
    assert.match(res.bodyData.error, /Missing GEMINI_API_KEY/);
    assert.equal(typeof res.bodyData, "object");
  });
});
