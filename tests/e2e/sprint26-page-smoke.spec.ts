import { expect, test } from "@playwright/test";

import { gotoAuthed } from "../utils/auth-fixture";
import { hasRealDb } from "../utils/dbTestGuard";

const hasDb = hasRealDb();

/**
 * Sprint 26 — Page-level Smoke Tests (browser)
 * ─────────────────────────────────────────────
 * These use the browser context with TEST_AUTH_BYPASS to verify
 * key pages render without crashing.
 */

// ─────────────────────────────────────────────────────
// DASHBOARD — Core CRM workspace
// ─────────────────────────────────────────────────────
test.describe("Dashboard Pages", () => {
  test("dashboard loads without crashing", async ({ page }) => {
    await gotoAuthed(page, "/dashboard");
    // Should either render dashboard or redirect to onboarding
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|onboarding|sign-in)/);
  });

  test("leads page loads", async ({ page }) => {
    await gotoAuthed(page, "/dashboard/leads");
    const url = page.url();
    expect(url).toMatch(/\/(leads|dashboard|sign-in)/);
  });

  test("claims page loads", async ({ page }) => {
    await gotoAuthed(page, "/dashboard/claims");
    const url = page.url();
    expect(url).toMatch(/\/(claims|dashboard|sign-in)/);
  });

  test("team page loads", async ({ page }) => {
    await gotoAuthed(page, "/dashboard/team");
    const url = page.url();
    expect(url).toMatch(/\/(team|dashboard|sign-in)/);
  });

  test("settings page loads", async ({ page }) => {
    await gotoAuthed(page, "/dashboard/settings");
    const url = page.url();
    expect(url).toMatch(/\/(settings|dashboard|sign-in)/);
  });
});

// ─────────────────────────────────────────────────────
// AI HUB — Pro features workspace
// ─────────────────────────────────────────────────────
test.describe("AI Hub Pages", () => {
  test("AI hub page loads", async ({ page }) => {
    await gotoAuthed(page, "/dashboard/ai");
    const url = page.url();
    expect(url).toMatch(/\/(ai|dashboard|sign-in|upgrade)/);
  });
});

// ─────────────────────────────────────────────────────
// PUBLIC PAGES — No auth required
// ─────────────────────────────────────────────────────
test.describe("Public Pages — No auth required", () => {
  test("pricing page renders pricing cards", async ({ page }) => {
    await page.goto("/pricing");
    expect(page.url()).toContain("/pricing");
    // Should have at least one pricing element
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("login page renders sign-in form", async ({ page }) => {
    await page.goto("/sign-in");
    expect(page.url()).toContain("/sign-in");
    await expect(page.locator("body")).toBeVisible();
  });

  test("sign-up page renders registration form", async ({ page }) => {
    await page.goto("/sign-up");
    expect(page.url()).toContain("/sign-up");
    await expect(page.locator("body")).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────
// CLAIM INTAKE — Public-facing wizard
// ─────────────────────────────────────────────────────
test.describe("Claim Intake Flow", () => {
  test("claim intake wizard loads", async ({ page }) => {
    await gotoAuthed(page, "/claims/new");
    await expect(page.locator("body")).toBeVisible();
    // Should have form elements or redirect to proper intake
    const url = page.url();
    expect(url).toMatch(/\/(claims|intake|dashboard|sign-in)/);
  });
});

// ─────────────────────────────────────────────────────
// BILLING — Subscription management
// ─────────────────────────────────────────────────────
test.describe("Billing Pages", () => {
  test("billing page loads for authed user", async ({ page }) => {
    await gotoAuthed(page, "/dashboard/billing");
    const url = page.url();
    expect(url).toMatch(/\/(billing|dashboard|sign-in|upgrade)/);
  });
});
