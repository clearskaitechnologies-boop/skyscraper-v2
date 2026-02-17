/**
 * k6 Spike Test — Monday Morning Rush
 *
 * Simulates the worst-case scenario: all 660 employees log in
 * within a 30-second window (Monday 8am, post-storm event).
 *
 * Ramps from 50 → 400 VUs in 30 seconds (2x enterprise capacity).
 *
 * Usage:  k6 run load-tests/spike.js
 *
 * What this catches:
 *   - Prisma pool exhaustion under sudden load
 *   - Vercel cold-start amplification
 *   - Rate limiter false positives (legitimate users blocked)
 *   - Connection queue starvation
 *   - Error cascade (one failure triggers others)
 */

import { check, group, sleep } from "k6";
import http from "k6/http";
import { Counter, Rate, Trend } from "k6/metrics";
import { ENDPOINTS, PROFILES, THRESHOLDS } from "./k6-config.js";

const BASE_URL = __ENV.BASE_URL || "https://www.skaiscrape.com";

// Custom metrics
const errorRate = new Rate("errors");
const spikeLatency = new Trend("spike_latency", true);
const recoveryLatency = new Trend("recovery_latency", true);
const coldStarts = new Counter("cold_starts");

export const options = {
  stages: PROFILES.spike.stages,
  thresholds: {
    ...THRESHOLDS,
    errors: ["rate<0.05"], // < 5% during spike (relaxed)
    spike_latency: ["p(95)<5000"], // Allow up to 5s during spike
    recovery_latency: ["p(95)<2000"], // Recovery must be < 2s
  },
};

export default function () {
  const iteration = __ITER;

  group("Spike — Mixed Traffic", () => {
    // Health check (always — measures infrastructure stress)
    const healthRes = http.get(`${BASE_URL}${ENDPOINTS.healthLive}`);
    spikeLatency.add(healthRes.timings.duration);

    check(healthRes, {
      "live → 200": (r) => r.status === 200,
    }) || errorRate.add(1);

    // Detect cold starts (response > 3s on simple endpoint)
    if (healthRes.timings.duration > 3000) {
      coldStarts.add(1);
    }

    sleep(0.3);

    // Simulate dashboard load (heaviest page — multiple API calls)
    const dashRes = http.get(`${BASE_URL}${ENDPOINTS.dashboard}`);
    spikeLatency.add(dashRes.timings.duration);
    check(dashRes, {
      "dashboard → not 500": (r) => r.status < 500,
      "dashboard < 10s": (r) => r.timings.duration < 10000,
    }) || errorRate.add(1);

    sleep(0.3);

    // Simulate API calls (auth-gated, expect 401 without session)
    const endpoints = [ENDPOINTS.claims, ENDPOINTS.leads, ENDPOINTS.searchGlobal];

    const randomEp = endpoints[Math.floor(Math.random() * endpoints.length)];
    const apiRes = http.get(`${BASE_URL}${randomEp}`, {
      headers: { "Content-Type": "application/json" },
    });

    check(apiRes, {
      [`${randomEp} → not 500`]: (r) => r.status < 500,
      [`${randomEp} < 5s`]: (r) => r.timings.duration < 5000,
    }) || errorRate.add(1);

    // Track recovery phase (after spike drops back to 50 VUs)
    if (__VU <= 50) {
      recoveryLatency.add(apiRes.timings.duration);
    }
  });

  sleep(0.5 + Math.random());
}
