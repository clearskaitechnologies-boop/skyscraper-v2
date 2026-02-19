import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Routes Diagnostic Endpoint
 * Shows which app routes exist in the build
 */
export async function GET() {
  try {
    const manifestPath = path.join(process.cwd(), ".next/server/app-paths-manifest.json");

    if (!fs.existsSync(manifestPath)) {
      return NextResponse.json({
        ok: false,
        reason: "app-paths-manifest.json not available at runtime (normal on Vercel)",
        note: "Routes are bundled at build time in serverless environment",
        vercelEnv: process.env.VERCEL_ENV || "unknown",
      });
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const keys = Object.keys(manifest);

    return NextResponse.json({
      ok: true,
      hasDashboard: keys.some((k) => k.includes("/dashboard")),
      hasClaims: keys.some((k) => k.includes("/claims")),
      hasWeatherReport: keys.some((k) => k.includes("/weather")),
      hasReports: keys.some((k) => k.includes("/reports")),
      totalRoutes: keys.length,
      sampleKeys: keys.slice(0, 30),
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    });
  }
}
