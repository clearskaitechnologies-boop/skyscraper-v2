import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "playwright/tests",
  timeout: 60_000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02 } },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  outputDir: "playwright/artifacts",
});
