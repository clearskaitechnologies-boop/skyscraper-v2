import { expect,test } from '@playwright/test';

test('guarded buttons are disabled for viewer role', async ({ page }) => {
  // This test requires a viewer account - skip if not configured
  const viewerEmail = process.env.E2E_VIEW_EMAIL;
  const viewerPassword = process.env.E2E_VIEW_PASSWORD;

  if (!viewerEmail || !viewerPassword) {
    test.skip();
    return;
  }

  // Sign in as viewer
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(viewerEmail);
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByLabel('Password', { exact: false }).fill(viewerPassword);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // Check guarded buttons are disabled
  const guardedButtons = [
    'Add Payment',
    'Import ACH',
    'Request Endorsement',
    'Add Section',
    'Run AI',
    'Export',
  ];

  for (const buttonName of guardedButtons) {
    const button = page.getByRole('button', { name: new RegExp(buttonName, 'i') });
    if (await button.isVisible().catch(() => false)) {
      await expect(button).toBeDisabled();
    }
  }
});
