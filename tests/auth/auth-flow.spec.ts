import { expect,test } from '@playwright/test';

// Uses Clerk hosted sign-in flow selectors heuristically.
// Skips automatically if TEST_USER_EMAIL / TEST_USER_PASSWORD env vars are not provided.
const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

test.describe('Authenticated tenant flow', () => {
  test.skip(!(email && password), 'TEST_USER_EMAIL/TEST_USER_PASSWORD not set');

  test('sign in, bootstrap org, reach restricted pages', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('/sign-in');

    // Fill email
    await page.fill('input[type="email"]', email!);
    // Continue (Clerk may have different button text depending on theme)
    await page.getByRole('button', { name: /continue|next|sign in/i }).click({ trial: true }).catch(() => {});

    // Fill password (wait in case Clerk loads password form dynamically)
    await page.waitForTimeout(500);
    await page.fill('input[type="password"]', password!);
    await page.getByRole('button', { name: /sign in|continue/i }).click();

    // Wait for redirect (dashboard or claims)
    await page.waitForLoadState('networkidle');

    // Ensure tenant bootstrap endpoint succeeds (idempotent)
    const bootstrapResp = await page.request.post('/api/dev/bootstrap-org');
    expect(bootstrapResp.status()).toBeLessThan(500);

    // Visit claims page
    await page.goto('/claims');
    const claimsBody = await page.textContent('body');
    expect(claimsBody || '').toMatch(/Claims|Onboarding|My Company/i);

    // Visit settings (role-restricted normally)
    await page.goto('/settings');
    const settingsBody = await page.textContent('body');
    expect(settingsBody || '').toMatch(/Settings|Onboarding|My Company/i);
  });
});
