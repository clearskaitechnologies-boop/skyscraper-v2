/**
 * k6 Smoke Test — Quick Validation
 *
 * Verifies all critical endpoints are reachable and healthy.
 * 5 VUs, 2 minutes. Run before every deployment.
 *
 * Usage:  k6 run load-tests/smoke.js
 * CI:     k6 run --env BASE_URL=https://staging.skaiscrape.com load-tests/smoke.js
 */

import { check, group, sleep } from "k6";
import http from "k6/http";
import { Rate, Trend } from "k6/metrics";
import { ENDPOINTS, PROFILES } from "./k6-config.js";

const BASE_URL = __ENV.BASE_URL || "https://skaiscrape.com";

// Custom metrics
const errorRate = new Rate("errors");
const healthLatency = new Trend("health_latency", true);
const pageLatency = new Trend("page_latency", true);

export const options = {
  stages: PROFILES.smoke.stages,
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    // http_req_failed intentionally excluded — 401s on auth-gated endpoints are expected
    http_reqs: ["rate>5"],
    errors: ["rate<0.01"],
    health_latency: ["p(95)<500"], // Health checks < 500ms
    page_latency: ["p(95)<3000"], // Pages < 3s
  },
};

export default function () {
  // ─── Health Checks (no auth required) ──────────────────────────────────
  group("Health Checks", () => {
    const liveRes = http.get(`${BASE_URL}${ENDPOINTS.healthLive}`);
    healthLatency.add(liveRes.timings.duration);
    check(liveRes, {
      "GET /health/live → 200": (r) => r.status === 200,
      "liveness body ok": (r) => {
        try {
          return JSON.parse(r.body).status === "ok";
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);

    const readyRes = http.get(`${BASE_URL}${ENDPOINTS.healthReady}`);
    healthLatency.add(readyRes.timings.duration);
    check(readyRes, {
      "GET /health/ready → 200": (r) => r.status === 200,
    }) || errorRate.add(1);

    const deepRes = http.get(`${BASE_URL}${ENDPOINTS.healthDeep}`);
    healthLatency.add(deepRes.timings.duration);
    check(deepRes, {
      "GET /health/deep → 200|207": (r) => r.status === 200 || r.status === 207,
      "deep: db connected": (r) => {
        try {
          return JSON.parse(r.body).database?.connected === true;
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);
  });

  sleep(1);

  // ─── Public Pages ──────────────────────────────────────────────────────
  group("Public Pages", () => {
    const landingRes = http.get(`${BASE_URL}${ENDPOINTS.landing}`);
    pageLatency.add(landingRes.timings.duration);
    check(landingRes, {
      "GET / → 200": (r) => r.status === 200,
      "landing has content": (r) => r.body && r.body.length > 1000,
    }) || errorRate.add(1);

    const pricingRes = http.get(`${BASE_URL}${ENDPOINTS.pricing}`);
    pageLatency.add(pricingRes.timings.duration);
    check(pricingRes, {
      "GET /pricing → 200|308": (r) => r.status === 200 || r.status === 308,
    }) || errorRate.add(1);
  });

  sleep(1);

  // ─── Auth-Gated API (expect 401 without session) ──────────────────────
  group("API Auth Gates", () => {
    const endpoints = [
      ENDPOINTS.claims,
      ENDPOINTS.leads,
      ENDPOINTS.searchGlobal,
      ENDPOINTS.messages,
      ENDPOINTS.tokenBalance,
    ];

    for (const ep of endpoints) {
      const res = http.get(`${BASE_URL}${ep}`);
      check(res, {
        [`GET ${ep} → 401 (no auth)`]: (r) => r.status === 401,
        [`${ep} returns JSON error`]: (r) => {
          try {
            return JSON.parse(r.body).error !== undefined;
          } catch {
            return false;
          }
        },
      }) || errorRate.add(1);
    }
  });

  sleep(1);
}
