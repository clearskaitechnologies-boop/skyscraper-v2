// MODULE 4: Approvals - Client responds (approve/reject)
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

const respondSchema = z.object({
  approvalId: z.string(),
  status: z.enum(["approved", "denied"]),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const approval = await prisma.claimApproval.findUnique({
      where: { id: approvalId },
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
    console.error("[APPROVAL_RESPOND]", error);
    return NextResponse.json({ error: "Failed to respond to approval" }, { status: 500 });
  }
}
