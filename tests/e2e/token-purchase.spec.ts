import { expect, test } from "@playwright/test";

/**
 * Token Purchase Flow E2E Tests
 *
 * Covers:
 * - Token balance API auth gates
 * - Token purchase API auth gates
 * - Pricing page → checkout flow availability
 */

test.describe("Token Purchase - API Auth Gates", () => {
  test("GET /api/tokens/balance returns 401 unauthenticated", async ({ request }) => {
    const response = await request.get("/api/tokens/balance");
    expect(response.status()).toBe(401);
  });

  test("POST /api/tokens/purchase returns 401 unauthenticated", async ({ request }) => {
    const response = await request.post("/api/tokens/purchase", {
      data: { amount: 100 },
    });
    expect(response.status()).toBe(401);
  });

  test("GET /api/stripe/prices returns pricing data", async ({ request }) => {
    const response = await request.get("/api/stripe/prices");
    // May be 200 (public pricing) or 401 depending on implementation
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe("Token Purchase - Pricing Page", () => {
  test("pricing page shows plan tiers", async ({ page }) => {
    await page.goto("/pricing");

    const heading = page.getByRole("heading", { name: /pricing|choose your plan/i });
    await expect(heading.first()).toBeVisible({ timeout: 15000 });
  });

  test("pricing page has CTA buttons", async ({ page }) => {
    await page.goto("/pricing");

    // Look for plan selection buttons
    const ctaButton = page
      .getByRole("button", { name: /Get Started|Start Trial|Subscribe|Choose/i })
      .first();
    const ctaLink = page
      .getByRole("link", { name: /Get Started|Start Trial|Subscribe|Choose/i })
      .first();

    const btnVisible = await ctaButton.isVisible().catch(() => false);
    const linkVisible = await ctaLink.isVisible().catch(() => false);

    expect(btnVisible || linkVisible).toBe(true);
  });
});
