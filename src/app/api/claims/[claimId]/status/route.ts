import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const updateStatusSchema = z.object({
  lifecycleStage: z.enum([
    "FILED",
    "ADJUSTER_REVIEW",
    "APPROVED",
    "DENIED",
    "APPEAL",
    "BUILD",
    "COMPLETED",
    "DEPRECIATION",
  ]),
  notes: z.string().optional(),
});

/**
 * PATCH /api/claims/[id]/status - Update claim lifecycle stage
 */
export async function PATCH(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = updateStatusSchema.parse(body);

    // Get current claim
    const claim = await prisma.claims.findFirst({
      where: { id: params.claimId, orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // For now, update the status field instead of lifecycleStage
    // (lifecycleStage column doesn't exist in DB yet)
    const statusMap: Record<string, string> = {
      FILED: "new",
      ADJUSTER_REVIEW: "in_progress",
      APPROVED: "approved",
      DENIED: "denied",
      APPEAL: "appeal",
      BUILD: "in_progress",
      COMPLETED: "completed",
      DEPRECIATION: "completed",
    };

    const newStatus = statusMap[validated.lifecycleStage] || "new";

    // Update claim
    const updated = await prisma.claims.update({
      where: { id: params.claimId },
      data: {
        status: newStatus,
      },
      include: {
        properties: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    // H-18: Send webhook notification for status change
    try {
      const { WebhookService } = await import("@/lib/webhook-service");
      await WebhookService.sendClaimUpdated(updated.id, { status: newStatus }, updated.orgId);
    } catch (webhookError) {
      console.warn("[ClaimStatus] Webhook delivery failed:", webhookError);
    }

    // Get user info for activity
    const user = await currentUser();
    const userName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.emailAddresses?.[0]?.emailAddress || "Unknown User";

    // Log AI outcome if status is approved/denied - skipped (AIAction model not available)

    // Log activity
    const { nanoid } = await import("nanoid");
    await prisma.activities.create({
      data: {
        id: nanoid(),
        orgId,
        claimId: params.claimId,
        userId,
        userName,
        type: "status_change",
        title: "Claim Status Updated",
        description: validated.notes || `Status changed to ${validated.lifecycleStage}`,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ claim: updated }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error(`[PATCH /api/claims/${params.claimId}/status] Error:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to update claim status" },
      { status: 500 }
    );
  }
}
