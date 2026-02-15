import { NextRequest, NextResponse } from "next/server";

import { ok, withErrorHandler } from "@/lib/api/response";
import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

/**
 * GET /api/claims/[claimId]/reports
 * Fetch all reports for a claim from ai_reports table
 */
async function handleGET(req: NextRequest, { params }: { params: Promise<{ claimId: string }> }) {
  const authResult = await requireApiAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { userId, orgId } = authResult;
  const { claimId } = await params;

  // Verify claim access (org OR user)
  const accessResult = await verifyClaimAccess(claimId, orgId, userId);
  if (accessResult instanceof NextResponse) {
    return accessResult;
  }

  // Fetch all artifacts for this claim from GeneratedArtifact (universal system)
  try {
    const artifacts = await prisma.ai_reports.findMany({
      where: {
        claimId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        createdAt: true,
        attachments: true,
        userId: true,
        userName: true,
      },
    });

    // Transform to match expected format
    const reports = artifacts.map((artifact) => ({
      id: artifact.id,
      type: artifact.type.toLowerCase(),
      title: artifact.title,
      subtitle: `${artifact.status}`,
      createdAt: artifact.createdAt.toISOString(),
      createdBy: {
        name: artifact.userName || "System",
        email: "",
      },
      pdfUrl: null,
    }));

    return ok({ reports });
  } catch (dbError: any) {
    // Graceful fallback
    console.warn(
      "[GET /api/claims/[claimId]/reports] DB error (returning empty):",
      dbError.message
    );
    return ok({ reports: [], message: "Reports system not yet initialized" });
  }
}

export const GET = withErrorHandler(handleGET, "GET /api/claims/[claimId]/reports");
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
