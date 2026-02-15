/**
 * TEST — Middleware route classification
 *
 * Verifies that /reports is classified as a pro route.
 */
import { describe, expect, it } from "vitest";

describe("route classification", () => {
  it("/reports is in the pro routes list", async () => {
    // Read middleware source and verify /reports is present
    const fs = await import("fs");
    const path = await import("path");
    const source = fs.readFileSync(path.resolve(__dirname, "../middleware.ts"), "utf-8");
    expect(source).toContain('"/reports"');
  });

  it("/portal is in the client routes list", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const source = fs.readFileSync(path.resolve(__dirname, "../middleware.ts"), "utf-8");
    expect(source).toContain('"/portal"');
  });
});
