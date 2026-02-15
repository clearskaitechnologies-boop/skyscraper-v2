import { expect, test } from "@playwright/test";

/**
 * Pro Feature Smoke Tests
 *
 * Validates that pro-specific pages and API endpoints are reachable
 * and behave correctly (either require auth or return data).
 *
 * Covers:
 *   - Trades profile/hub pages
 *   - Vendor network pages
 *   - Connections dashboard
 *   - Pro settings
 *   - Analytics page
 *   - Messages page
 */

test.describe("Pro Feature Pages — Auth Required", () => {
  const PRO_FEATURE_PAGES = [
    { path: "/trades", label: "Trades Hub" },
    { path: "/vendors", label: "Vendor Network" },
    { path: "/messages", label: "Messages" },
    { path: "/analytics", label: "Analytics" },
    { path: "/contacts", label: "Contacts" },
    { path: "/teams", label: "Teams" },
    { path: "/leads", label: "Leads" },
    { path: "/appointments", label: "Appointments" },
    { path: "/invitations", label: "Invitations" },
    { path: "/settings", label: "Settings" },
    { path: "/reports", label: "Reports" },
    { path: "/jobs", label: "Jobs" },
  ];

  for (const { path, label } of PRO_FEATURE_PAGES) {
    test(`${label} (${path}) requires auth or loads`, async ({ page }) => {
      const response = await page.goto(path);
      const url = page.url();

      // Must not be a 500 error
      expect(response?.status(), `${path} returned server error`).not.toBe(500);

      // Should either require auth OR load the page
      const isAuthGated =
        url.includes("sign-in") ||
        (await page
          .locator("h1")
          .filter({ hasText: /Sign In Required/i })
          .isVisible()
          .catch(() => false));
      const isLoaded = response?.status() === 200;

      expect(isAuthGated || isLoaded, `${path} should require auth or load`).toBeTruthy();
    });
  }
});

test.describe("Pro API Endpoints — Smoke", () => {
  test("GET /api/trades/reviews returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/trades/reviews");
    expect(res.status()).toBe(401);
  });

  test("GET /api/trades/connections returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/trades/connections");
    expect(res.status()).toBe(401);
  });

  test("GET /api/leads returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/leads");
    expect(res.status()).toBe(401);
  });

  test("GET /api/contacts returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/contacts");
    expect(res.status()).toBe(401);
  });

  test("GET /api/teams returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/teams");
    expect(res.status()).toBe(401);
  });
});

test.describe("Public Trades Profile — No Auth", () => {
  test("GET /trades/profile/some-slug loads without auth", async ({ page }) => {
    const response = await page.goto("/trades/profile/test-profile");
    // Public route — should not redirect to sign-in
    const url = page.url();
    expect(url).not.toContain("sign-in");
    // Should be 200 (profile found) or 404 (profile not found) — not 500
    expect([200, 404]).toContain(response?.status());
  });
});
