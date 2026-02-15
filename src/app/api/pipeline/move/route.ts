/**
 * POST /api/pipeline/move
 * Move a claim or lead to a new pipeline stage
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { claimId, leadId, stage } = body;

    if (!stage) {
      return NextResponse.json({ error: "Stage is required" }, { status: 400 });
    }

    // Handle claim moves
    if (claimId) {
      const claim = await prisma.claims.findUnique({
        where: { id: claimId },
        select: { id: true, orgId: true, status: true },
      });

      if (!claim) {
        return NextResponse.json({ error: "Claim not found" }, { status: 404 });
      }

      // Map pipeline stage to claim status
      const stageToStatus: Record<string, string> = {
        new: "new",
        qualified: "in_progress",
        proposal: "in_progress",
        negotiation: "in_progress",
        won: "completed",
      };

      const newStatus = stageToStatus[stage] || stage;

      await prisma.claims.update({
        where: { id: claimId },
        data: {
          status: newStatus,
          lifecycle_stage: stage === "won" ? "CLOSED" : stage === "new" ? "INTAKE" : "ACTIVE",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, stage, status: newStatus });
    }

    // Handle lead moves
    if (leadId) {
      await prisma.leads.update({
        where: { id: leadId },
        data: { stage, updatedAt: new Date() },
      });

      return NextResponse.json({ success: true, stage });
    }

    return NextResponse.json({ error: "claimId or leadId required" }, { status: 400 });
  } catch (error) {
    console.error("[PIPELINE_MOVE]", error);
    return NextResponse.json({ error: "Failed to move job" }, { status: 500 });
  }
}
