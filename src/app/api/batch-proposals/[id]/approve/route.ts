import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin role check
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true, name: true },
    });

    if (!user || !["admin", "owner", "sales"].includes(user.role || "")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { id } = await context.params;

    // Get and update the job
    const job = await prisma.export_jobs.update({
      where: { id },
      data: {
        status: "APPROVED",
        metadata: {
          approvedAt: new Date().toISOString(),
          approvedBy: userId,
        },
        updated_at: new Date(),
      },
    });

    // Update status to processing
    await prisma.export_jobs.update({
      where: { id },
      data: { status: "PROCESSING", updated_at: new Date() },
    });

    // Extract metadata
    const metadata = job.metadata as Record<string, unknown> | null;
    const jobName = (metadata?.name as string) || "Batch Job";
    const homeCount = (metadata?.homeCount as number) || 0;

    // Log the approval activity
    await prisma.activities.create({
      data: {
        id: crypto.randomUUID(),
        orgId: job.org_id,
        type: "batch_proposal_approved",
        title: `Batch Proposal Approved: ${jobName}`,
        description: `${homeCount} homes approved for processing`,
        userId,
        userName: user.name || "System",
        metadata: { batchJobId: id, homeCount },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ job, status: "PROCESSING" });
  } catch (error) {
    logger.error("[BatchProposal Approve Error]", error);
    return NextResponse.json({ error: "Failed to approve batch job" }, { status: 500 });
  }
}
