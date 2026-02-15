// src/app/api/claims/[claimId]/artifacts/[artifactId]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

/**
 * PATCH /api/claims/[claimId]/artifacts/[artifactId]
 * Updates an existing artifact
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { claimId: string; artifactId: string } }
) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId, orgId } = authResult;

    // Verify claim access
    const accessResult = await verifyClaimAccess(params.claimId, orgId, userId);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }

    // Verify artifact exists and belongs to this claim/org
    const existing = await prisma.ai_reports.findFirst({
      where: {
        id: params.artifactId,
        claimId: params.claimId,
        orgId: orgId ?? undefined,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Artifact not found or access denied" }, { status: 404 });
    }

    const body = await req.json();
    const { title, content, status } = body;

    // Determine content format
    const isJson = typeof content === "object";

    // Update artifact
    const artifact = await prisma.ai_reports.update({
      where: { id: params.artifactId },
      data: {
        ...(title && { title }),
        ...(content !== undefined && {
          contentJson: isJson ? content : null,
          contentText: isJson ? null : String(content),
        }),
        ...(status && { status }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ artifact });
  } catch (error: any) {
    console.error("[PATCH /api/claims/[claimId]/artifacts/[artifactId]] Error:", error);
    return NextResponse.json({ error: "Failed to update artifact" }, { status: 500 });
  }
}

/**
 * DELETE /api/claims/[claimId]/artifacts/[artifactId]
 * Deletes an artifact
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { claimId: string; artifactId: string } }
) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId, orgId } = authResult;

    // Verify claim access
    const accessResult = await verifyClaimAccess(params.claimId, orgId, userId);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }

    // Verify artifact exists and belongs to this claim/org
    const existing = await prisma.ai_reports.findFirst({
      where: {
        id: params.artifactId,
        claimId: params.claimId,
        orgId: orgId ?? undefined,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Artifact not found or access denied" }, { status: 404 });
    }

    // Delete artifact
    await prisma.ai_reports.delete({
      where: { id: params.artifactId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /api/claims/[claimId]/artifacts/[artifactId]] Error:", error);
    return NextResponse.json({ error: "Failed to delete artifact" }, { status: 500 });
  }
}
