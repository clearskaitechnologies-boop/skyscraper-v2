// MODULE 4: Approvals - Client responds (approve/reject)
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { z } from "zod";

import { isAuthError, requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

const respondSchema = z.object({
  approvalId: z.string(),
  status: z.enum(["approved", "denied"]),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  const { orgId, userId } = auth;

  try {
    const body = await req.json();
    const parsed = respondSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { approvalId, status, notes } = parsed.data;

    // Org-scoped lookup — prevents cross-org approval manipulation
    const approval = await prisma.claimApproval.findFirst({
      where: { id: approvalId, orgId },
    });

    if (!approval) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    if (approval.status !== "pending") {
      return NextResponse.json(
        { error: "This approval has already been responded to" },
        { status: 409 }
      );
    }

    const updated = await prisma.claimApproval.update({
      where: { id: approvalId },
      data: {
        status,
        reviewedBy: userId,
        reviewedAt: new Date(),
        notes: notes || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      approval: updated,
      message: `Approval ${status}`,
    });
  } catch (error) {
    logger.error("[APPROVAL_RESPOND]", error);
    return NextResponse.json({ error: "Failed to respond to approval" }, { status: 500 });
  }
}
