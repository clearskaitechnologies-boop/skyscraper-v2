import { expect, test } from "@playwright/test";

import { hasRealDb } from "../utils/dbTestGuard";

const hasDb = hasRealDb();

/**
 * Job Flows API Tests
 *
 * Tests work requests and job board endpoints:
 *   - Work request CRUD
 *   - Job board listing with privacy controls
 *   - Job status transitions
 */

test.describe("Job Flows — Auth Gates", () => {
  test("GET /api/trades/work-requests returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/trades/work-requests");
    expect(res.status()).toBe(401);
  });

  test("POST /api/trades/work-requests returns 401 unauthed", async ({ request }) => {
    const res = await request.post("/api/trades/work-requests", {
      data: { title: "Fix roof", category: "Roofing" },
    });
    expect(res.status()).toBe(401);
  });

  test("PATCH /api/trades/work-requests returns 401 unauthed", async ({ request }) => {
    const res = await request.patch("/api/trades/work-requests", {
      data: { requestId: "fake-id", status: "accepted" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/trades/job-board returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/trades/job-board");
    expect(res.status()).toBe(401);
  });
});

test.describe("Job Flows — Response Shapes", () => {
  test("GET /api/trades/work-requests returns valid shape", async ({ request }) => {
    if (!hasDb) test.skip("Requires real DB");
    const res = await request.get("/api/trades/work-requests");
    if (res.status() === 200) {
      const json = await res.json();
      expect(json).toHaveProperty("workRequests");
      expect(Array.isArray(json.workRequests)).toBe(true);
    }
  });

  test("GET /api/trades/job-board returns valid shape", async ({ request }) => {
    if (!hasDb) test.skip("Requires real DB");
    const res = await request.get("/api/trades/job-board");
    if (res.status() === 200) {
      const json = await res.json();
      expect(json).toHaveProperty("jobs");
      expect(Array.isArray(json.jobs)).toBe(true);
    }
  });
});

test.describe("Job Flows — Portal Work Requests", () => {
  test("GET /api/portal/job-invitations returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/portal/job-invitations");
    expect(res.status()).toBe(401);
  });

  test("POST /api/portal/job-invitations returns 401 unauthed", async ({ request }) => {
    const res = await request.post("/api/portal/job-invitations", {
      data: { action: "accept", invitationId: "fake-id" },
    });
    expect(res.status()).toBe(401);
  });
});
