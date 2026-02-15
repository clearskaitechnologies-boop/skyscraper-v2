/**
 * Manual trigger endpoint for batch job processing
 * For testing/debugging without waiting for cron
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { processBatchJob } from "@/lib/batch-processing/processor";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { batchJobId } = body;

    if (!batchJobId) {
      return NextResponse.json({ error: "Missing batchJobId" }, { status: 400 });
    }

    // Verify job exists and belongs to user's org
    const job = await prisma.export_jobs.findFirst({
      where: {
        id: batchJobId,
        org_id: session.orgId || "",
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Start processing
    console.log(`[Manual] Starting batch job ${batchJobId}`);
    await processBatchJob(batchJobId);

    return NextResponse.json({
      success: true,
      message: "Batch job processing started",
      jobId: batchJobId,
    });
  } catch (error) {
    console.error("[Manual] Error processing batch job:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
