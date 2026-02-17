/**
 * k6 Load Test — SkaiScraper Enterprise Readiness
 *
 * Validates the platform can handle 200+ concurrent users
 * (Titan Restoration target: 180 employees).
 *
 * Install: brew install k6  (or: https://k6.io/docs/getting-started/installation/)
 * Run:     k6 run tests/load/k6-titan-load-test.js
 * Cloud:   k6 cloud tests/load/k6-titan-load-test.js
 */

import { check, group, sleep } from "k6";
import http from "k6/http";
import { Rate, Trend } from "k6/metrics";

// ── Custom Metrics ──────────────────────────────────────────────────────
const errorRate = new Rate("errors");
const healthLatency = new Trend("health_latency", true);
const apiLatency = new Trend("api_latency", true);

// ── Config ──────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "https://skaiscrape.com";

export const options = {
  scenarios: {
    // Phase 1: Warm-up (30s, ramp to 50 users)
    warmup: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "15s", target: 25 },
        { duration: "15s", target: 50 },
      ],
      gracefulRampDown: "5s",
    },

    // Phase 2: Sustained load (2 min, 100 concurrent)
    sustained: {
      executor: "constant-vus",
      vus: 100,
      duration: "2m",
      startTime: "35s",
    },

    // Phase 3: Spike test (30s, burst to 200)
    spike: {
      executor: "ramping-vus",
      startVUs: 100,
      stages: [
        { duration: "10s", target: 200 },
        { duration: "10s", target: 200 },
        { duration: "10s", target: 50 },
      ],
      startTime: "2m40s",
      gracefulRampDown: "5s",
    },
  },

  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1500"],
    errors: ["rate<0.01"], // <1% error rate
    health_latency: ["p(95)<200"], // Health checks < 200ms
    api_latency: ["p(95)<500"], // API calls < 500ms
  },
};

// ── Test Scenarios ──────────────────────────────────────────────────────

export default function () {
  group("Health Checks", () => {
    // Liveness probe
    const liveRes = http.get(`${BASE_URL}/api/health/live`);
    check(liveRes, {
      "health/live returns 200": (r) => r.status === 200,
      "health/live has status ok": (r) => {
        try {
          return JSON.parse(r.body).status === "ok";
        } catch {
          return false;
        }
      },
    });
    healthLatency.add(liveRes.timings.duration);
    errorRate.add(liveRes.status !== 200);

    // Deep health check
    const deepRes = http.get(`${BASE_URL}/api/health/deep`);
    check(deepRes, {
      "health/deep returns 200": (r) => r.status === 200,
    });
    healthLatency.add(deepRes.timings.duration);
    errorRate.add(deepRes.status !== 200);
  });

  group("Public Pages", () => {
    // Landing page
    const homeRes = http.get(`${BASE_URL}/`);
    check(homeRes, {
      "homepage loads": (r) => r.status === 200 || r.status === 308,
    });
    apiLatency.add(homeRes.timings.duration);
    errorRate.add(homeRes.status >= 500);

    // Sign-in page (renders without auth)
    const signInRes = http.get(`${BASE_URL}/sign-in`);
    check(signInRes, {
      "sign-in page loads": (r) => r.status === 200,
    });
    errorRate.add(signInRes.status >= 500);
  });

  group("API Endpoints (Unauthenticated)", () => {
    // Public vendor listings
    const vendorRes = http.get(`${BASE_URL}/api/trades/search?lat=33.45&lon=-112.07`);
    check(vendorRes, {
      "vendor search responds": (r) => r.status === 200 || r.status === 401,
    });
    apiLatency.add(vendorRes.timings.duration);
    errorRate.add(vendorRes.status >= 500);

    // Integration status (returns 401 for unauthed, but shouldn't 5xx)
    const intRes = http.get(`${BASE_URL}/api/integrations/status`);
    check(intRes, {
      "integrations status no 5xx": (r) => r.status < 500,
    });
    apiLatency.add(intRes.timings.duration);
    errorRate.add(intRes.status >= 500);
  });

  // Simulate realistic user behavior with pauses
  sleep(Math.random() * 2 + 0.5);
}

/**
 * Summary handler — outputs final report
 */
export function handleSummary(data) {
  const passed = data.root_group?.checks?.reduce((acc, c) => acc + (c.passes || 0), 0) || 0;
  const failed = data.root_group?.checks?.reduce((acc, c) => acc + (c.fails || 0), 0) || 0;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  TITAN LOAD TEST RESULTS`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  ✅ Checks Passed: ${passed}`);
  console.log(`  ❌ Checks Failed: ${failed}`);
  console.log(`  📊 Error Rate: ${(data.metrics?.errors?.values?.rate * 100 || 0).toFixed(2)}%`);
  console.log(
    `  ⏱️  p95 Latency: ${(data.metrics?.http_req_duration?.values?.["p(95)"] || 0).toFixed(0)}ms`
  );
  console.log(
    `  ⏱️  p99 Latency: ${(data.metrics?.http_req_duration?.values?.["p(99)"] || 0).toFixed(0)}ms`
  );
  console.log(`${"=".repeat(60)}\n`);

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}
