import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { runClaimAutomation } from "@/lib/ai/automation";
import { getDelegate } from "@/lib/db/modelAliases";
import prisma from "@/lib/prisma";

type Params = { params: { claimId: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const claimId = params.claimId;
    if (!claimId) {
      return NextResponse.json(
        { error: "claimId is required in route." },
        { status: 400 }
      );
    }

    // Load the raw context Dominus needs.
    // Keep it light for now; expand later.
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId: orgId ?? undefined },
    });

    if (!claim) {
      return NextResponse.json(
        { error: "Claim not found." },
        { status: 404 }
      );
    }

    const tasks = await prisma.tasks.findMany({
      where: { claimId, orgId: orgId ?? undefined },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const timeline = await getDelegate('claimTimelineEvent').findMany({
      where: { claimId, orgId: orgId ?? undefined },
      orderBy: { occurredAt: "asc" },
      take: 200,
    });

    // You can also load estimates, supplements, reports, etc., here later.

    const claimContext = {
      claim,
      tasks,
      timeline,
      orgId,
      userId,
    };

    const analysis = await runClaimAutomation({ claimContext });

    return NextResponse.json({ success: true, analysis }, { status: 200 });
  } catch (err) {
    console.error(
      "Error in /api/claims/[claimId]/automation/analyze:",
      err
    );
    return NextResponse.json(
      { success: false, error: "Failed to analyze claim." },
      { status: 500 }
    );
  }
}
