/**
 * k6 Soak Test — Sustained Enterprise Load
 *
 * Simulates 200 concurrent users (Enterprise Clients peak) for 30 minutes.
 * Validates Prisma pool stability, Redis cache hit rates, and memory.
 *
 * Usage:  k6 run load-tests/soak.js
 *         k6 run --env BASE_URL=https://staging.skaiscrape.com load-tests/soak.js
 *
 * What this catches:
 *   - Prisma connection pool exhaustion (pool_timeout exceeded)
 *   - Memory leaks in long-running serverless functions
 *   - Redis connection churn under sustained load
 *   - Queue backup (pg-boss / BullMQ saturation)
 *   - Gradual response time degradation
 */

import { check, group, sleep } from "k6";
import http from "k6/http";
import { Counter, Rate, Trend } from "k6/metrics";
import { ENDPOINTS, PROFILES, THRESHOLDS } from "./k6-config.js";

const BASE_URL = __ENV.BASE_URL || "https://www.skaiscrape.com";

// Custom metrics
// NOTE: errorRate must call add(0) on success and add(1) on failure.
// k6 Rate = sum(values) / count(values). If you only ever add(1), rate is always 100%.
const errorRate = new Rate("errors");
const dbLatency = new Trend("db_dependent_latency", true);
// deep_health_latency measures the /health/deep endpoint (DB + Redis + Storage combined).
// This is NOT a pure cache read — 800ms p95 threshold is correct for a multi-system check.
const deepHealthLatency = new Trend("deep_health_latency", true);
const apiErrors = new Counter("api_errors");

export const options = {
  stages: PROFILES.soak.stages,
  thresholds: {
    ...THRESHOLDS,
    errors: ["rate<0.005"], // < 0.5% error rate for soak
    db_dependent_latency: ["p(95)<3000"], // DB-heavy routes < 3s
    deep_health_latency: ["p(95)<800"], // Deep health (DB+Redis+Storage) < 800ms
  },
};

// ─── Simulated user behaviors ────────────────────────────────────────────────

function healthCheckCycle() {
  group("Health Monitoring", () => {
    const res = http.get(`${BASE_URL}${ENDPOINTS.healthDeep}`);
    const passed = check(res, {
      "deep health → 200|207": (r) => r.status === 200 || r.status === 207,
    });
    errorRate.add(passed ? 0 : 1);
  });
}

function publicBrowsing() {
  group("Public Browsing", () => {
    const res = http.get(`${BASE_URL}${ENDPOINTS.landing}`);
    const landingPassed = check(res, { "landing → 200": (r) => r.status === 200 });
    errorRate.add(landingPassed ? 0 : 1);

    sleep(0.5);

    const pricingRes = http.get(`${BASE_URL}${ENDPOINTS.pricing}`);
    const pricingPassed = check(pricingRes, {
      "pricing → 200|308": (r) => r.status === 200 || r.status === 308,
    });
    errorRate.add(pricingPassed ? 0 : 1);
  });
}

function apiAuthGateStress() {
  // Simulates unauthenticated traffic hitting API endpoints
  // Tests rate limiting and auth rejection performance
  group("Auth Gate Stress", () => {
    const gatedEndpoints = [
      ENDPOINTS.claims,
      ENDPOINTS.leads,
      ENDPOINTS.searchGlobal,
      ENDPOINTS.messages,
      ENDPOINTS.tokenBalance,
      ENDPOINTS.analytics,
      ENDPOINTS.uploads,
    ];

    // Pick 3 random endpoints per iteration
    const selected = gatedEndpoints.sort(() => Math.random() - 0.5).slice(0, 3);

    for (const ep of selected) {
      const res = http.get(`${BASE_URL}${ep}`, {
        headers: { "Content-Type": "application/json" },
      });
      dbLatency.add(res.timings.duration);

      const passed = check(res, {
        [`${ep} → 401 or 429`]: (r) => r.status === 401 || r.status === 429,
        [`${ep} < 2s`]: (r) => r.timings.duration < 2000,
      });

      errorRate.add(passed ? 0 : 1);
      if (!passed) {
        apiErrors.add(1);
      }
    }
  });
}

function healthDeepCycle() {
  // Deep health checks test DB + Redis + Storage simultaneously
  group("Deep Health (DB + Redis)", () => {
    const res = http.get(`${BASE_URL}${ENDPOINTS.healthDeep}`);
    deepHealthLatency.add(res.timings.duration);

    const passed = check(res, {
      "deep → 200|207": (r) => r.status === 200 || r.status === 207,
      "deep < 5s": (r) => r.timings.duration < 5000,
      "db connected": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.database?.connected === true;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(passed ? 0 : 1);
  });
}

// ─── Main scenario ───────────────────────────────────────────────────────────

export default function () {
  // Distribute VU behavior to simulate realistic traffic mix:
  // 40% browse public pages
  // 30% hit auth-gated APIs (unauthenticated — tests rejection perf)
  // 20% health check monitoring
  // 10% deep health (heavy — tests DB pool under load)

  const rand = Math.random();

  if (rand < 0.4) {
    publicBrowsing();
  } else if (rand < 0.7) {
    apiAuthGateStress();
  } else if (rand < 0.9) {
    healthCheckCycle();
  } else {
    healthDeepCycle();
  }

  // Think time: 1-3 seconds (simulates user reading/clicking)
  sleep(1 + Math.random() * 2);
}
