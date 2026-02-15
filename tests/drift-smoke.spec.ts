import { expect,test } from '@playwright/test';

import { gotoAuthed } from './utils/auth-fixture';
import { hasRealDb } from './utils/dbTestGuard';
const hasDb = hasRealDb();

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

test.describe('Drift hardened pages smoke', () => {
  test('vendors page loads heading', async ({ page }) => {
    await gotoAuthed(page, `${BASE}/vendors`);
    const header = page.locator('h1');
    await expect(header).toContainText(/Vendor|Directory|Sign In Required/i);
  });

  test('report history page accessible or gated', async ({ page }) => {
    await gotoAuthed(page, `${BASE}/reports/history`);
    const heading = page.locator('h1');
    await expect(heading).toContainText(/Report History|Sign In Required/i);
  });

  test('retail proposal builder accessible or gated', async ({ page }) => {
    await gotoAuthed(page, `${BASE}/reports/retail`);
    const h1 = page.locator('h1');
    await expect(h1).toContainText(/Retail Proposal Builder|Sign In Required/i);
  });
});
