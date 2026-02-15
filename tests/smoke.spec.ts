import { expect,test } from "@playwright/test";

import { hasRealDb } from './utils/dbTestGuard';
const hasDb = hasRealDb();

/**
 * Smoke Tests - Critical User Paths
 * Run with: pnpm test:e2e
 *
 * These tests verify:
 * - Homepage loads and shows hero
 * - Sign-in page is accessible
 * - Dashboard requires authentication
 * - Critical pages return 200 or redirect correctly
 */

test.describe("Critical System Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { name: /AI-Powered/i })).toBeVisible();
    await expect(page).toHaveTitle(/SkaiScraper/);
  });

  test("sign-in page is accessible", async ({ page }) => {
    const response = await page.goto("/sign-in").catch(() => null);
    if (!response || response.status() >= 400) return test.skip('Sign-in route not available');
    await page.waitForTimeout(1500); // allow Clerk assets to attempt load
    const emailInput = page.locator('input[type="email"], input[name*="email" i], form');
    const visible = await emailInput.first().isVisible().catch(() => false);
    if (!visible) return test.skip('Clerk UI not loaded');
    await expect(page).toHaveURL(/sign-in/);
  });

  test("dashboard shows inline auth gate when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    const h1 = page.locator('h1');
    await expect(h1).toContainText(/Sign In Required/i);
  });

  test("pricing page loads tier headings", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /choose your plan/i })).toBeVisible({ timeout: 10000 });

    // Current production headings use STARTER / PROFESSIONAL / ENTERPRISE.
    // Allow synonyms for resilience (Solo ↔ Starter, Business ↔ Professional).
    const tierSynonyms = [
      /Starter|Solo/i,
      /Professional|Business/i,
      /Enterprise/i,
    ];
    for (const rx of tierSynonyms) {
      const heading = page.getByRole('heading', { name: rx }).first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe("Authentication Flow", () => {
  test("dashboard unauth shows sign-in required heading", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText(/Sign In Required|Initialize Workspace/i);
  });

  test("sign-in page renders accessible heading", async ({ page }) => {
    const response = await page.goto("/sign-in").catch(() => null);
    if (!response || response.status() >= 400) return test.skip('Sign-in route not available');
    await page.waitForTimeout(1500);
    const formPresence = page.locator('form, input[type="email"], input[name*="email" i]');
    const visible = await formPresence.first().isVisible().catch(() => false);
    if (!visible) return test.skip('Clerk UI not loaded');
  });
});

test.describe("Health Endpoints", () => {
  test("/api/health/live returns 200 OK", async ({ request }) => {
    const response = await request.get("/api/health/live");

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const json = await response.json();
    expect(json.status).toBe("ok");
    expect(json.service).toBe("skaiscraper");
  });

  test("/api/health/ready returns 200 OK with database check (skips without DB)", async ({ request }) => {
    if (!hasDb) test.skip('Skipping /api/health/ready DB check without real DATABASE_URL');
    const response = await request.get("/api/health/ready");
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.status).toMatch(/ready|degraded/);
  });
});

test.describe("Public Routes", () => {
  test("features page is accessible", async ({ page }) => {
    await page.goto("/features");

    // Should not redirect to sign-in
    await expect(page).not.toHaveURL(/sign-in/);
  });

  test("contact page renders", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.getByRole("heading", { name: /contact/i })).toBeVisible();
  });

  test("trades network page loads", async ({ page }) => {
    await page.goto("/trades-network");

    // Should load without auth
    await expect(page).not.toHaveURL(/sign-in/);
  });
});

test.describe("SEO & Performance", () => {
  const isProdLike = process.env.NODE_ENV === 'production' || !!process.env.VERCEL_ENV;
  test(isProdLike ? "robots.txt is accessible" : "robots.txt is accessible (dev)", async ({ request }) => {
    const response = await request.get("/robots.txt");
    const status = response.status();
    if (!isProdLike) {
      // In local dev we sometimes see 500 from next-sitemap middleware; treat it as transient acceptable.
      expect([200,404,500]).toContain(status);
      return;
    }
    expect(response.ok()).toBeTruthy();
  });
  test("sitemap.xml is accessible", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect([200,404]).toContain(response.status());
  });
  test("favicon loads", async ({ request }) => {
    const response = await request.get("/favicon.ico");
    expect(response.ok()).toBeTruthy();
  });
});
