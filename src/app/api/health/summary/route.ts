export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { assertStorageReady } from "@/lib/storage";

// Prisma singleton imported from @/lib/db/prisma

export async function GET() {
  try {
    const { orgId } = await auth();

    // Storage status
    const storageStatus = await assertStorageReady();

    // Version info (could be enhanced with actual commit hash from CI/CD)
    const versions = {
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || null,
      deployment: process.env.VERCEL_URL ? "vercel" : "local",
    };

    return NextResponse.json({
      storage: storageStatus,
      versions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health summary failed:", error);

    // Return degraded health info even if main check fails
    return NextResponse.json({
      storage: {
        enabled: false,
        ready: false,
        bucket: null,
      },
      tokens: {
        remaining: 0,
      },
      versions: {
        commit: null,
        deployment: "unknown",
      },
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
}
