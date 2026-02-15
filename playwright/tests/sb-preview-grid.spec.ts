import { expect,test } from "@playwright/test";

test("ReportPreviewGrid story renders and matches baseline", async ({ page }) => {
  // Storybook iframe URL for the story
  await page.goto("http://127.0.0.1:6006/iframe.html?id=reportpreviewgrid--default");
  await page.waitForLoadState("networkidle");
  const root = page.locator("body");
  await expect(root).toHaveScreenshot("report-preview-grid.png");
});
