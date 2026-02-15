import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

/**
 * Public diagnostic endpoint - shows what routes exist in build
 * Used to verify critical routes are present in deployed manifest
 */
export async function GET() {
  try {
    const manifestPath = path.join(process.cwd(), ".next/server/app-paths-manifest.json");

    // Check if manifest exists at runtime
    if (!fs.existsSync(manifestPath)) {
      return NextResponse.json({
        ok: false,
        reason: "manifest not available at runtime",
        note: "This is expected on some hosting platforms",
      });
    }

    const manifestContent = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestContent);

    // Get all route keys
    const routes = Object.keys(manifest);

    // Check for critical routes
    const hasDashboard = routes.includes("/dashboard/page");
    const hasClaims = routes.includes("/claims/page");
    const hasWeatherReport = routes.includes("/weather-report/page");
    const hasReports = routes.includes("/reports/page");

    // Get sample of routes (first 50)
    const sampleKeys = routes.slice(0, 50);

    return NextResponse.json({
      ok: true,
      totalRoutes: routes.length,
      criticalRoutes: {
        hasDashboard,
        hasClaims,
        hasWeatherReport,
        hasReports,
      },
      sampleKeys,
      // Full list would be too large for response
      note: "Use sampleKeys to see what routes are present",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        reason: "error reading manifest",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
