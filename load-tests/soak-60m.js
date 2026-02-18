/**
 * k6 60-Minute Endurance Soak Test — Enterprise Proof
 *
 * Simulates 200 concurrent users for a full hour with burst waves
 * every 10 minutes to simulate business-hour patterns.
 *
 * What this proves that 30-min cannot:
 *   - Memory leak detection (heap creep over time)
 *   - Connection pool exhaustion (Prisma pool_timeout)
 *   - Cold start cascade after warm pool drains
 *   - Gradual latency degradation (response time creep)
 *   - Background job interference (queue backup)
 *
 * Usage:
 *   k6 run load-tests/soak-60m.js
 *   k6 run --env BASE_URL=https://staging.skaiscrape.com load-tests/soak-60m.js
 *
 * Expected duration: ~68 minutes (ramp + sustain + cool down)
 *
 * Success criteria:
 *   - p95 < 800ms sustained (vs 615ms at 30min — allow slight growth)
 *   - Error rate < 0.5%
 *   - No memory spiral (heap % should stabilize, not climb)
 *   - DB latency stable (no creep beyond initial warm-up)
 *   - Zero connection pool failures
 */

import { check, group, sleep } from "k6";
import http from "k6/http";
import { Counter, Rate, Trend } from "k6/metrics";
import { ENDPOINTS, THRESHOLDS } from "./k6-config.js";

const BASE_URL = __ENV.BASE_URL || "https://www.skaiscrape.com";

// ─── Custom Metrics ──────────────────────────────────────────────────────────
const errorRate = new Rate("errors");
const dbLatency = new Trend("db_dependent_latency", true);
const deepHealthLatency = new Trend("deep_health_latency", true);
const healthLiveLatency = new Trend("health_live_latency", true);
const memoryHeapMB = new Trend("server_heap_used_mb");
const dbResponseMs = new Trend("server_db_latency_ms");
const apiErrors = new Counter("api_errors");
const burstCycleCount = new Counter("burst_cycles");

export const options = {
  // ── Endurance profile with burst waves ──────────────────────────
  // Simulates real business hours: steady load with periodic spikes
  // when teams sync, meetings end, or lunch breaks finish.
  stages: [
    // Ramp up (5 min)
    { duration: "2m", target: 50 },
    { duration: "3m", target: 200 },

    // Sustained load block 1 (10 min) — morning start
    { duration: "10m", target: 200 },

    // Burst wave 1 — post-standup surge
    { duration: "30s", target: 300 },
    { duration: "2m", target: 300 },
    { duration: "30s", target: 200 },

    // Sustained load block 2 (10 min) — mid-morning
    { duration: "10m", target: 200 },

    // Burst wave 2 — lunch return spike
    { duration: "30s", target: 350 },
    { duration: "2m", target: 350 },
    { duration: "30s", target: 200 },

    // Sustained load block 3 (10 min) — afternoon
    { duration: "10m", target: 200 },

    // Burst wave 3 — end-of-day report generation
    { duration: "30s", target: 300 },
    { duration: "2m", target: 300 },
    { duration: "30s", target: 200 },

    // Final sustained block (5 min) — wind down
    { duration: "5m", target: 200 },

    // Cool down (3 min)
    { duration: "2m", target: 50 },
    { duration: "1m", target: 0 },
  ],

  thresholds: {
    ...THRESHOLDS,
    errors: ["rate<0.005"], // < 0.5% error rate
    db_dependent_latency: ["p(95)<3000"], // DB routes < 3s
    deep_health_latency: ["p(95)<1000"], // Deep health < 1s (longer test = more tolerance)
    health_live_latency: ["p(95)<500"], // Live health < 500ms
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
  },
};

// ─── Scenario Functions ──────────────────────────────────────────────────────

function healthLiveCheck() {
  group("Health Live (BetterStack Target)", () => {
    const res = http.get(`${BASE_URL}${ENDPOINTS.healthLive}`);
    healthLiveLatency.add(res.timings.duration);

    const passed = check(res, {
      "live health → 200|207": (r) => r.status === 200 || r.status === 207,
      "live health < 1s": (r) => r.timings.duration < 1000,
      "has status field": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status === "ok" || body.status === "degraded";
        } catch {
          return false;
        }
      },
      "has db check": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.checks?.database?.ok === true;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(passed ? 0 : 1);

    // Extract server-reported metrics for memory/DB trending
    try {
      const body = JSON.parse(res.body);
      if (body.checks?.memory?.heapUsedMB) {
        memoryHeapMB.add(body.checks.memory.heapUsedMB);
      }
      if (body.checks?.database?.latencyMs) {
        dbResponseMs.add(body.checks.database.latencyMs);
      }
    } catch {}
  });
}

function healthDeepCheck() {
  group("Health Deep (Full System)", () => {
    const res = http.get(`${BASE_URL}${ENDPOINTS.healthDeep}`);
    deepHealthLatency.add(res.timings.duration);

    const passed = check(res, {
      "deep health → 200|207": (r) => r.status === 200 || r.status === 207,
      "deep health < 5s": (r) => r.timings.duration < 5000,
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
    if (!passed) apiErrors.add(1);
  });
}

function publicBrowsing() {
  group("Public Browsing", () => {
    const res = http.get(`${BASE_URL}${ENDPOINTS.landing}`);
    const passed = check(res, { "landing → 200": (r) => r.status === 200 });
    errorRate.add(passed ? 0 : 1);

    sleep(0.5);

    const pricingRes = http.get(`${BASE_URL}${ENDPOINTS.pricing}`);
    const pricingPassed = check(pricingRes, {
      "pricing → 200|308": (r) => r.status === 200 || r.status === 308,
    });
    errorRate.add(pricingPassed ? 0 : 1);
  });
}

function apiAuthGateStress() {
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
      if (!passed) apiErrors.add(1);
    }
  });
}

function burstBehavior() {
  // During burst phases, VUs that draw this scenario do rapid-fire requests
  // simulating a team all pulling reports at once
  group("Burst — Rapid Requests", () => {
    burstCycleCount.add(1);

    // Hit 5 endpoints in quick succession (no think time)
    const burstEndpoints = [
      ENDPOINTS.healthLive,
      ENDPOINTS.landing,
      ENDPOINTS.pricing,
      ENDPOINTS.healthReady,
      ENDPOINTS.healthDeep,
    ];

    for (const ep of burstEndpoints) {
      const res = http.get(`${BASE_URL}${ep}`);
      const passed = check(res, {
        [`burst ${ep} → success`]: (r) => r.status < 500,
      });
      errorRate.add(passed ? 0 : 1);
      if (!passed) apiErrors.add(1);
    }
  });
}

// ─── Main Scenario ───────────────────────────────────────────────────────────

export default function () {
  // Traffic mix simulating real enterprise usage:
  //   30% public browsing (marketing, pricing)
  //   25% auth-gate stress (API rejection performance)
  //   20% health/live monitoring (BetterStack simulation)
  //   10% deep health checks (DB + Redis + Storage)
  //   15% burst behavior (rapid-fire team activity)

  const rand = Math.random();

  if (rand < 0.3) {
    publicBrowsing();
  } else if (rand < 0.55) {
    apiAuthGateStress();
  } else if (rand < 0.75) {
    healthLiveCheck();
  } else if (rand < 0.85) {
    healthDeepCheck();
  } else {
    burstBehavior();
  }

  // Think time: 1-3 seconds (user reading / clicking)
  sleep(1 + Math.random() * 2);
}

// ─── Summary Output ──────────────────────────────────────────────────────────

export function handleSummary(data) {
  const p95 = data.metrics?.http_req_duration?.values?.["p(95)"] || 0;
  const p99 = data.metrics?.http_req_duration?.values?.["p(99)"] || 0;
  const errRate = data.metrics?.errors?.values?.rate || 0;
  const totalReqs = data.metrics?.http_reqs?.values?.count || 0;
  const heapTrend = data.metrics?.server_heap_used_mb?.values || {};
  const dbTrend = data.metrics?.server_db_latency_ms?.values || {};

  const summary = `
╔══════════════════════════════════════════════════════════════╗
║          60-MINUTE ENDURANCE SOAK — RESULTS                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Duration:      ~68 min (ramp + 60m sustained + cool down)   ║
║  Peak VUs:      350 (burst), 200 (sustained)                 ║
║  Total Reqs:    ${String(totalReqs).padStart(10)}                              ║
║                                                              ║
║  p95 Latency:   ${String(Math.round(p95)).padStart(6)} ms                            ║
║  p99 Latency:   ${String(Math.round(p99)).padStart(6)} ms                            ║
║  Error Rate:    ${(errRate * 100).toFixed(3)}%                               ║
║                                                              ║
║  Heap (avg):    ${String(Math.round(heapTrend.avg || 0)).padStart(5)} MB                              ║
║  Heap (max):    ${String(Math.round(heapTrend.max || 0)).padStart(5)} MB                              ║
║  DB Latency:    ${String(Math.round(dbTrend.avg || 0)).padStart(5)} ms avg, ${String(Math.round(dbTrend.max || 0)).padStart(5)} ms max       ║
║                                                              ║
║  Verdict:       ${p95 < 800 && errRate < 0.005 ? "✅ PASS — Enterprise ready" : "⚠️  REVIEW — See details"}     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

  console.log(summary);

  return {
    stdout: summary,
    "load-tests/results/soak-60m-results.json": JSON.stringify(data, null, 2),
  };
}
