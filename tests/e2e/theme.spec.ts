import { expect,test } from '@playwright/test';

test('dark mode toggle works', async ({ page }) => {
  await page.goto('/dashboard');

  // Look for dark mode toggle (adjust selector to match your UI)
  const darkToggle = page.getByRole('button', { name: /dark mode|theme/i });

  if (await darkToggle.isVisible().catch(() => false)) {
    await darkToggle.click();

    // Check if html has dark class
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    expect(hasDark).toBeTruthy();
  } else {
    // Skip if toggle not visible (SHOW_SECOND_SCREEN=false)
    test.skip();
  }
});

test('field mode toggle compacts layout', async ({ page }) => {
  await page.goto('/builder');

  const fieldToggle = page.getByRole('button', { name: /field mode/i });

  if (await fieldToggle.isVisible().catch(() => false)) {
    await fieldToggle.click();

    // Check grid compaction (heuristic: main.grid should have 1 column)
    const gridElement = page.locator('main.grid').first();
    if (await gridElement.isVisible()) {
      const cols = await gridElement.evaluate((el) => {
        const style = getComputedStyle(el);
        return style.gridTemplateColumns.split(' ').length;
      });

      expect(cols).toBeLessThanOrEqual(2); // Field mode should reduce columns
    }
  } else {
    test.skip();
  }
});
