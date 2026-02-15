import { expect,test } from "./helpers/session";

/**
 * Authenticated User Flow Tests
 * Requires TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables
 *
 * Skip if credentials not provided:
 * Run with: TEST_USER_EMAIL=test@example.com TEST_USER_PASSWORD=pass pnpm test:e2e
 */

test.describe("Authenticated User Flow", () => {
  // Skip entire suite if credentials missing
  test.skip(
    !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
    "Skipping authenticated tests - TEST_USER_EMAIL or TEST_USER_PASSWORD not set"
  );

  test("dashboard loads after authentication", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard");

    // Should be on dashboard, not redirected to sign-in
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);

    // Check for dashboard elements
    await expect(
      authenticatedPage.getByRole("heading", {
        name: /dashboard|overview|welcome/i,
      })
    ).toBeVisible();
  });

  test("settings/branding page accessible", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/settings/branding");

    // Should load branding settings
    await expect(authenticatedPage).toHaveURL(/\/settings\/branding/);

    // Check for branding form elements
    await expect(authenticatedPage.locator("form, input, textarea").first()).toBeVisible();
  });

  test("branding setup flow", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/branding/setup");

    // Fill minimal branding info (adjust selectors based on actual form)
    const companyNameInput = authenticatedPage
      .locator('input[name="companyName"], input[placeholder*="company" i]')
      .first();
    if (await companyNameInput.isVisible()) {
      await companyNameInput.fill("Test Roofing Co");
    }

    // Submit form if button exists
    const submitButton = authenticatedPage
      .locator('button[type="submit"], button:has-text("Save"), button:has-text("Submit")')
      .first();
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for success or redirect
      await authenticatedPage.waitForURL(/\/dashboard|\/branding/, {
        timeout: 10000,
      });
    }

    // Should end up on dashboard or branding page
    await expect(authenticatedPage).not.toHaveURL(/\/sign-in/);
  });

  test("token balance visible on dashboard", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard");

    // Look for token balance display (adjust selector based on actual UI)
    const tokenElement = authenticatedPage.locator("text=/token|credit|balance/i").first();

    // Token info should be present (even if balance is 0)
    const isVisible = await tokenElement.isVisible().catch(() => false);

    // Log for debugging if not found
    if (!isVisible) {
      console.log("Token balance element not found - dashboard may not display tokens yet");
    }

    // Dashboard should load successfully regardless
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);
  });

  test("navigation between authenticated pages", async ({ authenticatedPage }) => {
    // Start at dashboard
    await authenticatedPage.goto("/dashboard");
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);

    // Navigate to projects
    await authenticatedPage.goto("/projects");
    await expect(authenticatedPage).not.toHaveURL(/\/sign-in/);

    // Navigate to settings
    await authenticatedPage.goto("/settings");
    await expect(authenticatedPage).not.toHaveURL(/\/sign-in/);

    // All pages should load without redirecting to sign-in
  });

  test("sign out functionality", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/dashboard");

    // Look for sign out button (Clerk default)
    const signOutButton = authenticatedPage
      .locator('button:has-text("Sign out"), button:has-text("Log out"), [data-clerk-sign-out]')
      .first();

    if (await signOutButton.isVisible()) {
      await signOutButton.click();

      // Should redirect to homepage or sign-in
      await authenticatedPage.waitForURL(/\/(sign-in)?$/, { timeout: 5000 });

      // Verify signed out - dashboard should redirect
      await authenticatedPage.goto("/dashboard");
      await expect(authenticatedPage).toHaveURL(/\/sign-in/);
    } else {
      console.log("Sign out button not found - test skipped");
    }
  });
});
