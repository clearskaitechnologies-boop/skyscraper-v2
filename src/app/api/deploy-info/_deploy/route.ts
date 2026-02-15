import { NextResponse } from "next/server";

/**
 * Public diagnostic endpoint - shows what build is deployed
 * Used to verify production deployment without guessing
 */
export async function GET() {
  const commitSha =
    process.env.NEXT_PUBLIC_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "unknown";

  const vercelEnv = process.env.VERCEL_ENV || "unknown";
  const buildTime = new Date().toISOString();
  const nodeVersion = process.version;

  return NextResponse.json({
    ok: true,
    commitSha,
    vercelEnv,
    buildTime,
    node: nodeVersion,
    // Additional useful info
    deployment: {
      region: process.env.VERCEL_REGION || "unknown",
      url: process.env.VERCEL_URL || "unknown",
    },
  });
}
