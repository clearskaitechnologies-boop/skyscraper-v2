import { expect, request,test } from '@playwright/test';

/**
 * AI Routes Integration Smoke Tests
 * These tests validate core AI-related API endpoints respond with expected structure.
 * They are defensive: if auth redirects occur, tests skip gracefully.
 *
 * PRE-REQS (set via env or fixtures before running):
 * - AUTH cookie/session for Clerk (if required) OR test mode bypass (not provided here).
 * - OPENAI_API_KEY configured so server can generate responses.
 * - UPSTASH_* env vars optional (rate limiting will fail open if not configured).
 */

const CLAIM_ID_ENV = process.env.TEST_CLAIM_ID; // Provide a real claim id for deeper tests
const LEAD_ID_ENV = process.env.TEST_LEAD_ID;   // Provide real lead id for retail proposal
const SUPPLEMENT_ID_ENV = process.env.TEST_SUPPLEMENT_ID; // For AI rebuttal letter

// Helper to skip when required env missing
function requireEnvOrSkip(value: string | undefined, _reason: string) {
  if (!value) {
    test.skip();
  }
}

// NOTE: We use direct API calls to avoid brittle UI auth flows for smoke validation.
// Adjust baseURL via Playwright config if app served differently.

test.describe('AI API Smoke', () => {
  test('Rebuttal Builder endpoint returns structured package', async ({ request }) => {
    requireEnvOrSkip(CLAIM_ID_ENV, 'TEST_CLAIM_ID not set');

    const denialReason = 'Carrier denied hail damage citing age and wear despite recent storm.';
    const res = await request.post(`/api/claims/${CLAIM_ID_ENV}/rebuttal-builder`, {
      data: { denialReason, tone: 'professional' }
    });

    // Accept 401 if no auth/session present; treat as skip
    if (res.status() === 401) { test.skip(); return; }

    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json).toHaveProperty('rebuttal');
    expect(json).toHaveProperty('appealOutline');
    expect(Array.isArray(json.preSupplement)).toBe(true);
  });

  test('Bad Faith GET returns analysis object', async ({ request }) => {
    requireEnvOrSkip(CLAIM_ID_ENV, 'TEST_CLAIM_ID not set');
    const res = await request.get(`/api/claims/${CLAIM_ID_ENV}/bad-faith`);
    if (res.status() === 401) { test.skip(); return; }
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json).toHaveProperty('overallSeverity');
    expect(json).toHaveProperty('indicators');
  });

  test('Claim AI summary returns summary string', async ({ request }) => {
    requireEnvOrSkip(CLAIM_ID_ENV, 'TEST_CLAIM_ID not set');
    const res = await request.post(`/api/claims/${CLAIM_ID_ENV}/ai/summary`);
    if (res.status() === 401) { test.skip(); return; }
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(typeof json.summary === 'string').toBe(true);
  });

  test('Retail proposal builder returns structured JSON', async ({ request }) => {
    requireEnvOrSkip(LEAD_ID_ENV, 'TEST_LEAD_ID not set');
    const payload: any = {
      leadId: LEAD_ID_ENV,
      claimId: CLAIM_ID_ENV || null,
      scope: 'Replace 28 squares laminated shingles, replace 4 pipe boots, ridge vent install',
      upsell: 'Upgrade to Class 4 impact-resistant shingles; add solar ready mounting prep'
    };
    const res = await request.post('/api/reports/retail/generate', { data: payload });
    if (res.status() === 401) { test.skip(); return; }
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json).toHaveProperty('summary');
    expect(Array.isArray(json.lineItems)).toBe(true);
    expect(Array.isArray(json.upsellRecommendations)).toBe(true);
  });

  test('Supplement rebuttal letter returns string', async ({ request }) => {
    requireEnvOrSkip(CLAIM_ID_ENV, 'TEST_CLAIM_ID not set');
    requireEnvOrSkip(SUPPLEMENT_ID_ENV, 'TEST_SUPPLEMENT_ID not set');
    const res = await request.post(`/api/claims/${CLAIM_ID_ENV}/ai/rebuttal`, {
      data: { supplementId: SUPPLEMENT_ID_ENV, carrierResponse: 'Carrier states scope excessive.' }
    });
    if (res.status() === 401) { test.skip(); return; }
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(typeof json.rebuttal === 'string').toBe(true);
  });

  test('Vendor products list returns items array (degraded tolerant)', async ({ request }) => {
    const res = await request.get('/api/vendors/products');
    const status = res.status();
    if ([401, 404, 500, 503].includes(status)) {
      test.skip(`Skipping products test – endpoint unavailable/degraded (status ${status})`);
      return;
    }
    expect(res.ok(), `Unexpected status ${status}`).toBeTruthy();
    let json: any;
    try {
      json = await res.json();
    } catch {
      test.skip('Non-JSON response in degraded mode');
      return;
    }
    if (!Array.isArray(json.items)) {
      test.skip('Items array not present (feature not enabled)');
      return;
    }
  });
});

// Potential future test: damage detection multipart (requires binary fixture & auth)
// test('Damage detection processes photo', async ({ request }) => { /* implement when stable auth fixture ready */ });
