/**
 * Build Identity Endpoint - Shows what commit/branch is actually deployed
 * Use this to verify production is serving the expected code
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const buildInfo = {
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      commitShort: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) ?? null,
      branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      nodeEnv: process.env.NODE_ENV ?? null,
      timestamp: new Date().toISOString(),
      region: process.env.VERCEL_REGION ?? null,
    };

    return NextResponse.json(buildInfo);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Build info failed",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
