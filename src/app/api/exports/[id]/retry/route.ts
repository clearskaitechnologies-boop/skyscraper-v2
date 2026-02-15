export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// API: RETRY EXPORT JOB
// ============================================================================

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getDelegate } from "@/lib/db/modelAliases";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = params.id;

    // Get existing job
    const job = await getDelegate("exportJob").findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Reset status to queued
    await getDelegate("exportJob").update({
      where: { id: jobId },
      data: {
        status: "queued",
        error: null,
        updatedAt: new Date(),
      },
    });

    // ENHANCEMENT: Trigger export worker to retry this export job

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Export Retry]", error);
    return NextResponse.json({ error: error.message || "Failed to retry export" }, { status: 500 });
  }
}
