import { expect,test } from "@playwright/test";

// Hardened KPI test: uses data-testid selectors and fails fast on server error overlay.
test("dashboard renders KPI cards without server error", async ({ page }) => {
  await page.goto("/dashboard");

  // Skip if redirected to sign-in (unauthenticated environment).
  if (/sign-in/.test(page.url())) {
    test.skip(true, "Requires authentication to view dashboard KPIs");
  }

  // Allow network to settle.
  await page.waitForLoadState("networkidle", { timeout: 15000 });

  // Fail fast if the Next.js error overlay appears.
  const serverErrorLocator = page.getByText(/Server Error/i);
  if (await serverErrorLocator.isVisible()) {
    throw new Error("Server Error overlay detected on /dashboard – instrumentation or runtime issue");
  }

  // Assert KPI cards by test IDs.
  const testIds = [
    "kpi-active-leads",
    "kpi-open-claims",
    "kpi-revenue-mtd",
    "kpi-conversion-rate",
  ];
  for (const id of testIds) {
    await expect(page.getByTestId(id)).toBeVisible();
  }
});
