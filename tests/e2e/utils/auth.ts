import { Page } from '@playwright/test';

export async function signIn(
  page: Page,
  { email, password }: { email: string; password: string }
) {
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(email);
  // Use exact Continue button (avoid social auth Continue combination strict mode violation)
  await page.getByRole('button', { name: /^Continue$/ }).click();
  // Password input can appear twice (input + show toggle); restrict to input textbox role
  await page.getByRole('textbox', { name: /password/i }).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}
