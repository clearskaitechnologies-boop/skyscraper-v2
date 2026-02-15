// src/app/api/diag/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get build info
    const buildId = process.env.VERCEL_GIT_COMMIT_SHA || "LOCAL";
    const buildTime = process.env.VERCEL_BUILD_TIME || new Date().toISOString();

    // Get user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get org context
    let orgResult: Awaited<ReturnType<typeof getActiveOrgContext>> | null = null;
    let orgError: string | null = null;
    try {
      orgResult = await getActiveOrgContext({ required: false });
    } catch (err: any) {
      orgError = err.message;
    }

    // Extract org info based on result type
    const orgResolved = orgResult?.ok || false;
    const orgId = orgResult?.ok ? orgResult.orgId : null;
    const orgReason = orgResult && !orgResult.ok ? orgResult.reason : orgError;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      build: {
        commitSha: buildId,
        buildTime: buildTime,
      },
      auth: {
        userId: user?.id || null,
        email: user?.emailAddresses?.[0]?.emailAddress || null,
        authenticated: !!user,
      },
      org: {
        resolved: orgResolved,
        orgId: orgId,
        orgSlug: null, // Not in OrgContextResult type
        reason: orgReason || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
