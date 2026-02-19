import { requireApiAuth } from "@/lib/auth/apiAuth";
import { NextResponse } from "next/server";

/**
 * GET /api/build-verify
 * Returns build metadata to verify what's deployed
 * Locked: exposes git SHA, env, version
 */
export async function GET() {
  const authResult = await requireApiAuth();
  if (authResult instanceof NextResponse) return authResult;

  return NextResponse.json({
    git: process.env.VERCEL_GIT_COMMIT_SHA || null,
    gitShort: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8) || null,
    deployment: process.env.VERCEL_URL || null,
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || null,
    ts: new Date().toISOString(),
    version: "3.0.4",
  });
}
