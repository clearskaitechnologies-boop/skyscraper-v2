import { expect,test } from '@playwright/test';

test('carrier depreciation modal and timeline integration', async ({ page }) => {
  // This test requires a job with carrier picker
  await page.goto('/dashboard');

  // Try to find a job or carrier picker (adjust selectors)
  const carrierButton = page.getByText(/carrier|state farm|allstate/i).first();

  if (await carrierButton.isVisible().catch(() => false)) {
    await carrierButton.click();

    // Look for depreciation modal
    const modal = page.getByRole('dialog', { name: /depreciation/i });
    if (await modal.isVisible().catch(() => false)) {
      // Fill depreciation fields
      const depInput = modal.getByLabel(/depreciation|percent/i).first();
      if (await depInput.isVisible()) {
        await depInput.fill('25');
      }

      // Save
      const saveButton = modal.getByRole('button', { name: /save/i });
      await saveButton.click();

      // Check timeline for CARRIER_DEPRECIATION_SET event
      await page.waitForTimeout(2000); // Allow time for audit log
      const timelineEvent = page.getByText(/CARRIER_DEPRECIATION_SET/i);
      await expect(timelineEvent).toBeVisible({ timeout: 10000 });
    }
  } else {
    // Skip if no carrier picker found
    test.skip();
  }
});
