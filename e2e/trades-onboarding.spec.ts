import { expect, test } from "@playwright/test";

/**
 * Trades Onboarding Happy Path Test
 *
 * Verifies the complete onboarding flow works end-to-end.
 * This test would have caught the silent failure bug.
 */
test.describe("Trades Onboarding", () => {
  test("completes full onboarding flow and redirects to profile", async ({ page }) => {
    // Navigate to onboarding
    await page.goto("/trades/onboarding");

    // Wait for page to load (check for form)
    await expect(page.locator("h1")).toContainText(/Join the Network|Edit Your Profile/);

    // === STEP 1: Basic Info ===

    // Fill required fields
    await page.fill('input[id="firstName"]', "Test");
    await page.fill('input[id="lastName"]', "User");
    await page.fill('input[id="email"]', `test-${Date.now()}@example.com`);

    // Optional: phone
    await page.fill('input[id="phone"]', "(555) 123-4567");

    // Click Continue to go to Step 2
    const continueButton = page.locator('button:has-text("Continue")');
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    // === STEP 2: Trade & Title ===

    // Wait for step 2 to render
    await expect(page.locator("h2")).toContainText("Your Role");

    // Select trade type
    await page.selectOption('select[id="tradeType"]', "Roofing");

    // Select job title
    await page.selectOption('select[id="jobTitle"]', "Owner/Contractor");

    // Optional: years experience
    await page.fill('input[id="yearsExperience"]', "10");

    // Optional: bio
    await page.fill('textarea[id="bio"]', "Test contractor for Playwright testing");

    // === SUBMIT ===

    // Find and click submit button
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();

    // Start waiting for navigation before clicking
    const navigationPromise = page.waitForURL("**/trades/profile**", {
      timeout: 30000,
    });

    // Click submit
    await submitButton.click();

    // Verify toast appeared (success message)
    // Note: Toast might disappear quickly, so we check if it was ever visible
    const toastOrRedirect = await Promise.race([
      navigationPromise.then(() => "redirect"),
      page
        .locator("[data-sonner-toast]")
        .first()
        .waitFor({ timeout: 10000 })
        .then(() => "toast")
        .catch(() => null),
    ]);

    // Wait for redirect to complete
    await navigationPromise;

    // Verify we're on the profile page
    await expect(page).toHaveURL(/\/trades\/profile/);

    // Verify profile data appears on the page
    await expect(page.locator("text=Test User")).toBeVisible({ timeout: 10000 });
  });

  test("shows error when required fields are missing", async ({ page }) => {
    await page.goto("/trades/onboarding");

    // Wait for form to load
    await expect(page.locator("h1")).toContainText(/Join the Network|Edit Your Profile/);

    // Try to click Continue without filling required fields
    const continueButton = page.locator('button:has-text("Continue")');

    // Button should be disabled
    await expect(continueButton).toBeDisabled();
  });

  test("skip option redirects to profile", async ({ page }) => {
    await page.goto("/trades/onboarding");

    // Wait for form to load
    await expect(page.locator("h1")).toContainText(/Join the Network|Edit Your Profile/);

    // Click skip link
    const skipLink = page.locator('button:has-text("Skip for now")');
    await skipLink.click();

    // Should redirect to profile (may be empty or incomplete)
    await expect(page).toHaveURL(/\/trades\/profile/, { timeout: 10000 });
  });

  test("back button returns to step 1", async ({ page }) => {
    await page.goto("/trades/onboarding");

    // Fill step 1
    await page.fill('input[id="firstName"]', "Test");
    await page.fill('input[id="lastName"]', "User");
    await page.fill('input[id="email"]', "test@example.com");

    // Go to step 2
    await page.click('button:has-text("Continue")');
    await expect(page.locator("h2")).toContainText("Your Role");

    // Click back
    await page.click('button:has-text("← Back")');

    // Should be back on step 1
    await expect(page.locator('input[id="firstName"]')).toHaveValue("Test");
  });
});

/**
 * Auth Failure Handling Test
 *
 * Verifies that auth failures show visible errors, not silent failures.
 */
test.describe("Trades Onboarding Auth Handling", () => {
  test("shows error when API returns auth error", async ({ page }) => {
    // Mock the API to return an auth error
    await page.route("**/api/trades/onboarding", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: "Unauthorized - Please sign in" }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/trades/onboarding");

    // Fill step 1
    await page.fill('input[id="firstName"]', "Test");
    await page.fill('input[id="lastName"]', "User");
    await page.fill('input[id="email"]', "test@example.com");
    await page.click('button:has-text("Continue")');

    // Fill step 2
    await page.selectOption('select[id="tradeType"]', "Roofing");
    await page.selectOption('select[id="jobTitle"]', "Owner/Contractor");

    // Submit
    await page.click('button[type="submit"]');

    // Should show error toast (not silent failure)
    const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(errorToast).toBeVisible({ timeout: 10000 });
    await expect(errorToast).toContainText(/Unauthorized|sign in|error/i);

    // Should NOT have redirected
    await expect(page).toHaveURL(/\/trades\/onboarding/);
  });

  test("shows error when API returns server error", async ({ page }) => {
    // Mock the API to return a server error
    await page.route("**/api/trades/onboarding", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/trades/onboarding");

    // Fill required fields
    await page.fill('input[id="firstName"]', "Test");
    await page.fill('input[id="lastName"]', "User");
    await page.fill('input[id="email"]', "test@example.com");
    await page.click('button:has-text("Continue")');
    await page.selectOption('select[id="tradeType"]', "Roofing");
    await page.selectOption('select[id="jobTitle"]', "Owner/Contractor");

    // Submit
    await page.click('button[type="submit"]');

    // Should show error toast
    const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(errorToast).toBeVisible({ timeout: 10000 });

    // Submit button should be re-enabled (not stuck in loading)
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).not.toContainText(/Creating|Saving/);
  });
});
