import { Page } from '@playwright/test';

/**
 * Establish a test auth context for protected pages without real Clerk sign-in.
 * Relies on safeOrgContext override (TEST_AUTH_USER_ID / TEST_AUTH_ORG_ID env vars).
 * Simply navigates to a lightweight public route first to ensure cookies/env applied.
 */
export async function ensureTestAuth(page: Page) {
  // Touch root to warm dev server.
  await page.goto('/');
  // Nothing else required; server logic reads env and ensures membership.
}

/** Use before navigating to protected pages in tests. */
export async function gotoAuthed(page: Page, path: string) {
  await ensureTestAuth(page);
  await page.goto(path);
}