import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;
    if (!orgId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 });
    }

    const { claimId } = params;

    // Verify claim access
    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) return accessResult;

    // Fetch AI reports for this claim
    const reports = await prisma.ai_reports.findMany({
      where: {
        claimId,
        orgId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        type: r.type,
        status: r.status,
        input: r.prompt,
        output: r.content,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[API /claims/[claimId]/ai-reports] Error:", error);
    return NextResponse.json(
      { reports: [], error: "Failed to load AI reports" },
      { status: 200 } // Safe 200 response - never crash the UI
    );
  }
}
