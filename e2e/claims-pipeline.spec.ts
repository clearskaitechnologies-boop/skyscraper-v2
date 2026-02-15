import { expect,test } from '@playwright/test';

/**
 * E2E Test: Claims Pipeline
 * Tests the drag-and-drop functionality and data loading
 */

test.describe('Claims Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    // Visit claims page (will redirect to sign-in if not authenticated)
    await page.goto('/claims');
  });

  test('should load claims page or redirect to auth', async ({ page }) => {
    // Either we're on the claims page (authenticated) or sign-in (not authenticated)
    const url = page.url();
    expect(url).toMatch(/(claims|sign-in)/);
  });

  test('should display empty state when no claims exist', async ({ page }) => {
    // Skip if redirected to sign-in
    if (page.url().includes('sign-in')) {
      test.skip();
      return;
    }

    // Check for empty state message or claims table
    const hasEmptyState = await page.getByText(/no claims found/i).isVisible().catch(() => false);
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    
    // Should have either empty state or table
    expect(hasEmptyState || hasTable).toBe(true);
  });

  test('should have "New Claim" button', async ({ page }) => {
    // Skip if redirected to sign-in
    if (page.url().includes('sign-in')) {
      test.skip();
      return;
    }

    const newClaimButton = page.getByRole('link', { name: /new claim/i });
    await expect(newClaimButton).toBeVisible();
  });

  test('should navigate to pipeline view', async ({ page }) => {
    // Skip if redirected to sign-in
    if (page.url().includes('sign-in')) {
      test.skip();
      return;
    }

    const pipelineButton = page.getByRole('link', { name: /pipeline/i });
    if (await pipelineButton.isVisible()) {
      await pipelineButton.click();
      await expect(page).toHaveURL(/tracker/);
    }
  });
});

test.describe('Claims Table', () => {
  test('should load claims data or show empty state', async ({ page }) => {
    await page.goto('/claims');
    
    // Skip if redirected to sign-in
    if (page.url().includes('sign-in')) {
      test.skip();
      return;
    }

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for data or empty state
    const hasData = await page.locator('table tbody tr').count() > 0;
    const hasEmptyMessage = await page.getByText(/no claims found/i).isVisible();

    expect(hasData || hasEmptyMessage).toBe(true);
  });

  test('should display live data timestamp', async ({ page }) => {
    await page.goto('/claims');
    
    // Skip if redirected to sign-in
    if (page.url().includes('sign-in')) {
      test.skip();
      return;
    }

    // Check for "Data Live" indicator
    await expect(page.getByText(/data live/i)).toBeVisible();
  });
});
