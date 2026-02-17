/**
 * k6 Stress Test — Find the Breaking Point
 *
 * Ramps from 100 → 500 VUs to identify the exact concurrency
 * level where the system degrades.
 *
 * Usage:  k6 run load-tests/stress.js
 *
 * What this catches:
 *   - Maximum concurrent user capacity
 *   - Prisma pool_timeout threshold
 *   - Vercel function concurrency limits
 *   - At what load does p95 exceed SLA (2s)?
 *   - At what load does error rate exceed 1%?
 */

import { check, group, sleep } from "k6";
import http from "k6/http";
import { Rate, Trend } from "k6/metrics";
import { ENDPOINTS, PROFILES } from "./k6-config.js";

const BASE_URL = __ENV.BASE_URL || "https://skaiscrape.com";

const errorRate = new Rate("errors");
const responseTime = new Trend("response_time", true);

export const options = {
  stages: PROFILES.stress.stages,
  thresholds: {
    // Intentionally relaxed — we WANT to find the breaking point
    http_req_duration: ["p(95)<10000"], // Allow up to 10s
    http_req_failed: ["rate<0.20"], // Allow up to 20% failure
    errors: ["rate<0.20"],
  },
};

export default function () {
  group("Stress — Health Probe", () => {
    const res = http.get(`${BASE_URL}${ENDPOINTS.healthDeep}`);
    responseTime.add(res.timings.duration);

    check(res, {
      "health → not 500": (r) => r.status < 500,
      "health < 10s": (r) => r.timings.duration < 10000,
    }) || errorRate.add(1);
  });

  sleep(0.2);

  group("Stress — Public Pages", () => {
    const pages = [ENDPOINTS.landing, ENDPOINTS.pricing];
    const page = pages[Math.floor(Math.random() * pages.length)];
    const res = http.get(`${BASE_URL}${page}`);
    responseTime.add(res.timings.duration);

    check(res, {
      [`${page} → not 500`]: (r) => r.status < 500,
    }) || errorRate.add(1);
  });

  sleep(0.2);

  group("Stress — API Endpoints", () => {
    const apis = [
      ENDPOINTS.claims,
      ENDPOINTS.leads,
      ENDPOINTS.searchGlobal,
      ENDPOINTS.messages,
      ENDPOINTS.tokenBalance,
      ENDPOINTS.analytics,
    ];

    // Hit 2 random APIs per iteration
    for (let i = 0; i < 2; i++) {
      const api = apis[Math.floor(Math.random() * apis.length)];
      const res = http.get(`${BASE_URL}${api}`, {
        headers: { "Content-Type": "application/json" },
      });
      responseTime.add(res.timings.duration);

      check(res, {
        [`${api} → not 500`]: (r) => r.status < 500,
      }) || errorRate.add(1);
    }
  });

  sleep(0.5 + Math.random());
}
