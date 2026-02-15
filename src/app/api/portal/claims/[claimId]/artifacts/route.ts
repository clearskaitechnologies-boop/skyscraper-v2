import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { assertPortalAccess } from "@/lib/auth/portalAccess";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/portal/claims/[claimId]/artifacts
 * List artifacts for a claim (portal access)
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ claimId: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { claimId } = await params;

    // Verify portal access
    await assertPortalAccess({ userId, claimId });

    // Fetch artifacts for this claim
    // ai_reports has: id, orgId, type, title, prompt, content, tokensUsed, model, claimId, status, attachments, createdAt
    // NOT: version, thumbnailUrl, thumbnailSvg, pdfUrl
    const artifacts = await prisma.ai_reports.findMany({
      where: {
        claimId,
        status: { not: "ARCHIVED" },
      },
      orderBy: [{ type: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        createdAt: true,
        attachments: true,
      },
    });

    return NextResponse.json({ artifacts });
  } catch (error: any) {
    console.error("[GET /api/portal/claims/[claimId]/artifacts] Error:", error);

    if (error.message?.includes("Access denied")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to fetch artifacts" }, { status: 500 });
  }
}
