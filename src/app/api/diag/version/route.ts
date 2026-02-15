import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  return NextResponse.json(
    {
      env: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || "unknown",
      project: process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.NEXT_PUBLIC_APP_URL || "",
      branch: process.env.VERCEL_GIT_COMMIT_REF || "unknown",
      commit: process.env.VERCEL_GIT_COMMIT_SHA || "dev",
      buildTime: process.env.__BUILD_TIME__ || "",
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
