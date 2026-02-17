/**
 * TEST — Integrations status API shape
 *
 * Ensures the integrations status endpoint exists and includes
 * the required response keys for enterprise credibility UI.
 */
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

describe("/api/integrations/status response shape", () => {
  const routePath = join(
    __dirname,
    "..",
    "..",
    "src",
    "app",
    "api",
    "integrations",
    "status",
    "route.ts"
  );

  const source = readFileSync(routePath, "utf-8");

  it("exports a GET handler", () => {
    expect(source).toContain("export async function GET");
  });

  it("includes QuickBooks, migrations, and system sections", () => {
    expect(source).toContain("quickbooks");
    expect(source).toContain("migrations");
    expect(source).toContain("system");
  });

  it("includes migration sources and webhook status", () => {
    expect(source).toContain("acculynx");
    expect(source).toContain("jobnimbus");
    expect(source).toContain("webhooks");
  });
});
