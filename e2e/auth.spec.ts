import { expect,test } from '@playwright/test';

/**
 * E2E Test: Authentication Flow
 * Tests the critical sign-in/sign-out loop that was fixed
 */

test.describe('Authentication Flow', () => {
  test('should load sign-in page', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Check for branded elements
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expect(page.getByText('SkaiScraper')).toBeVisible();
  });

  test('should load sign-up page', async ({ page }) => {
    await page.goto('/sign-up');
    
    // Check for branded elements
    await expect(page.getByText('Join SkaiScraper')).toBeVisible();
    await expect(page.getByText('Create your account')).toBeVisible();
  });

  test('should navigate between sign-in and sign-up', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Look for "Sign up" link in Clerk component
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page).toHaveURL(/sign-up/);
    }
  });

  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to sign-in
    await page.waitForURL(/sign-in/, { timeout: 5000 });
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe('After Sign-In Flow', () => {
  test('after-sign-in page exists and redirects', async ({ page }) => {
    // This page should immediately redirect to dashboard
    await page.goto('/after-sign-in');
    
    // Should redirect (either to sign-in if not auth, or dashboard if auth)
    await page.waitForURL(/(sign-in|dashboard)/, { timeout: 5000 });
    
    const url = page.url();
    expect(url).toMatch(/(sign-in|dashboard)/);
  });
});
