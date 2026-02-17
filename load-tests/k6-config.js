/**
 * k6 Load Testing Configuration
 * SkaiScraper Enterprise Readiness — 200 Concurrent Users
 *
 * Usage:
 *   k6 run load-tests/smoke.js              # Quick validation (5 VUs, 1 min)
 *   k6 run load-tests/soak.js               # Sustained load (200 VUs, 30 min)
 *   k6 run load-tests/spike.js              # Spike test (0 → 400 VUs)
 *   k6 run load-tests/stress.js             # Find breaking point (ramp to 500)
 *
 * Targets:
 *   Titan Roofing:  180 employees → ~90 concurrent users peak
 *   Pro West:       480 employees → ~120 concurrent users peak
 *   Combined:       660 employees → ~200 concurrent users peak
 *   Safety margin:  2x → test at 400 VUs for spike scenarios
 */

// ─── Shared thresholds (enterprise SLA: 99.5% uptime, p95 < 2s) ─────────────
export const THRESHOLDS = {
  http_req_duration: ["p(95)<2000", "p(99)<5000"], // 95th < 2s, 99th < 5s
  // NOTE: http_req_failed intentionally excluded from shared thresholds.
  // Auth-gated endpoints return 401 (expected), which k6 counts as "failed".
  // Each test script should set its own failure threshold if needed.
  http_reqs: ["rate>5"], // > 5 RPS (smoke), scale to 50+ under load
};

// ─── Target endpoints ────────────────────────────────────────────────────────
// Note: skaiscrape.com redirects to www.skaiscrape.com — use www to avoid 308 noise
export const BASE_URL = __ENV.BASE_URL || "https://www.skaiscrape.com";

export const ENDPOINTS = {
  // Health (no auth)
  healthLive: "/api/health/live",
  healthReady: "/api/health/ready",
  healthDeep: "/api/health/deep",

  // Public
  pricing: "/pricing",
  landing: "/",

  // Auth-gated API (require Clerk session)
  dashboard: "/dashboard",
  claims: "/api/claims",
  leads: "/api/leads",
  searchGlobal: "/api/search/global",
  messages: "/api/messages/threads",
  analytics: "/api/analytics/dashboard",
  tokenBalance: "/api/tokens/balance",
  uploads: "/api/uploads",
  weather: "/api/weather/alerts",

  // Heavy operations
  aiReport: "/api/ai/report",
  pdfGenerate: "/api/reports/generate",
};

// ─── Load profiles ───────────────────────────────────────────────────────────
export const PROFILES = {
  smoke: {
    stages: [
      { duration: "30s", target: 5 },
      { duration: "1m", target: 5 },
      { duration: "30s", target: 0 },
    ],
  },

  // Normal enterprise load — 200 concurrent users sustained
  soak: {
    stages: [
      { duration: "2m", target: 50 }, // Ramp up
      { duration: "3m", target: 100 }, // Half load
      { duration: "5m", target: 200 }, // Full enterprise load
      { duration: "15m", target: 200 }, // Sustain
      { duration: "3m", target: 50 }, // Cool down
      { duration: "2m", target: 0 }, // Drain
    ],
  },

  // Spike — Monday morning rush (everyone logs in at once)
  spike: {
    stages: [
      { duration: "1m", target: 50 }, // Normal
      { duration: "30s", target: 500 }, // Spike (2.5x capacity)
      { duration: "3m", target: 500 }, // Sustain spike
      { duration: "30s", target: 50 }, // Drop back
      { duration: "2m", target: 50 }, // Recovery
      { duration: "1m", target: 0 },
    ],
  },

  // Stress — find the breaking point
  stress: {
    stages: [
      { duration: "2m", target: 100 },
      { duration: "2m", target: 200 },
      { duration: "2m", target: 300 },
      { duration: "2m", target: 400 },
      { duration: "2m", target: 500 },
      { duration: "5m", target: 500 }, // Sustain at peak
      { duration: "3m", target: 0 },
    ],
  },
};
