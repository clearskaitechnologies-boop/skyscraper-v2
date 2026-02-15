import { expect, Page,test as base } from "@playwright/test";

/**
 * Clerk Authentication Helper for Playwright
 *
 * Usage:
 * ```ts
 * test('authenticated flow', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/dashboard');
 *   await expect(authenticatedPage.getByText('Welcome')).toBeVisible();
 * });
 * ```
 */

export interface AuthFixtures {
  authenticatedPage: Page;
}

/**
 * Sign in to Clerk using test credentials
 * Only runs once per worker for performance
 */
async function authenticate(page: Page): Promise<void> {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in environment for authenticated tests"
    );
  }

  // Navigate to sign-in page
  await page.goto("/sign-in");

  // Wait for Clerk to load
  await page.waitForSelector("[data-clerk-sign-in]", { timeout: 10000 });

  // Fill in email
  const emailInput = page.locator('input[name="identifier"], input[type="email"]').first();
  await emailInput.fill(email);
  await emailInput.press("Enter");

  // Wait for password field
  await page.waitForSelector('input[name="password"], input[type="password"]', {
    timeout: 5000,
  });

  // Fill in password
  const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
  await passwordInput.fill(password);
  await passwordInput.press("Enter");

  // Wait for redirect to dashboard or successful auth
  await page.waitForURL(/\/(dashboard|after-sign-in)/, { timeout: 15000 });

  // Verify authentication succeeded
  await expect(page).not.toHaveURL(/sign-in/);
}

/**
 * Extended test fixture with authenticated session
 * Automatically signs in before each test
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Authenticate once per test
    await authenticate(page);

    // Use the authenticated page
    await use(page);
  },
});

export { expect };
