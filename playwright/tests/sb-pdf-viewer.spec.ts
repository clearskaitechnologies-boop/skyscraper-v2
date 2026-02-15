import { expect,test } from "@playwright/test";

const slots = ["A", "B1", "B2", "D", "E", "F"];

for (const s of slots) {
  test(`snapshot ${s}`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:6006/iframe.html?id=reportpdfviewer--${s.toLowerCase()}`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toHaveScreenshot({ name: `report-${s}.png` });
  });
}
