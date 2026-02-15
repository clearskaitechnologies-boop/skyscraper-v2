import { expect, test } from "@playwright/test";

/**
 * Portal (Client) Smoke Tests
 *
 * Validates that client portal pages load correctly.
 * Portal routes are accessible via Clerk auth (handled by middleware).
 */

test.describe("Portal Pages — Load Check", () => {
  const PORTAL_PAGES = [
    { path: "/portal", label: "Portal Home" },
    { path: "/portal/find-a-pro", label: "Find a Pro" },
    { path: "/portal/projects/new", label: "New Project" },
  ];

  for (const { path, label } of PORTAL_PAGES) {
    test(`${label} (${path}) loads without 500`, async ({ page }) => {
      const response = await page.goto(path);
      const status = response?.status() ?? 0;
      // Should not 500. May redirect to client sign-in or show content
      expect(status, `${path} returned server error`).not.toBe(500);
    });
  }
});

test.describe("Portal API — Auth Gates", () => {
  test("GET /api/portal/connections returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/portal/connections");
    expect(res.status()).toBe(401);
  });

  test("GET /api/portal/network returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/portal/network");
    expect(res.status()).toBe(401);
  });

  test("GET /api/portal/direct-messages returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/portal/direct-messages");
    expect(res.status()).toBe(401);
  });

  test("POST /api/portal/connect-pro returns 401 unauthed", async ({ request }) => {
    const res = await request.post("/api/portal/connect-pro", {
      data: { proId: "fake-id" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/portal/accept-pro-invite returns 401 unauthed", async ({ request }) => {
    const res = await request.post("/api/portal/accept-pro-invite", {
      data: { connectionId: "fake-id" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/portal/community/feed returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/portal/community/feed");
    expect(res.status()).toBe(401);
  });

  test("GET /api/portal/job-invitations returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/portal/job-invitations");
    expect(res.status()).toBe(401);
  });
});

test.describe("Client Auth Routes — Public", () => {
  test("/client/sign-in loads without error", async ({ page }) => {
    const response = await page.goto("/client/sign-in");
    expect(response?.status()).not.toBe(500);
  });

  test("/client/sign-up loads without error", async ({ page }) => {
    const response = await page.goto("/client/sign-up");
    expect(response?.status()).not.toBe(500);
  });
});
