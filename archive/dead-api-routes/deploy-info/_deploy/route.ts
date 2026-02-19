import { requireApiAuth } from "@/lib/auth/apiAuth";
import { NextResponse } from "next/server";

/**
 * Deployment diagnostic endpoint
 * Locked: exposes Vercel region, deployment URL, Node version
 */
export async function GET() {
  const authResult = await requireApiAuth();
  if (authResult instanceof NextResponse) return authResult;

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
