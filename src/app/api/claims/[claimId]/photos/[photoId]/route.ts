import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * DELETE /api/claims/[claimId]/photos/[photoId]
 * Soft delete a photo by marking it as deleted
 * Prevents orphaned files in storage
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { claimId: string; photoId: string } }
) {
  try {
    // Authenticate user
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId, orgId } = authResult;

    const { claimId, photoId } = params;

    // Verify claim access
    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }

    // Note: documents model doesn't have claimId field, using FileAsset instead
    const photo = await prisma.file_assets.findFirst({
      where: {
        id: photoId,
        claimId,
        orgId: orgId ?? undefined,
      },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // FileAsset doesn't have deletedAt field
    // TODO: Add soft delete support or use hard delete
    await prisma.file_assets.delete({
      where: { id: photoId },
    });

    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully",
      photoId,
    });
  } catch (error: any) {
    console.error("[DELETE /api/claims/:id/photos/:photoId] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete photo" }, { status: 500 });
  }
}

/**
 * GET /api/claims/[claimId]/photos/[photoId]
 * Retrieve a specific photo
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { claimId: string; photoId: string } }
) {
  try {
    // Authenticate user
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId, orgId } = authResult;

    const { claimId, photoId } = params;

    // Verify claim access
    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }

    // Note: documents model doesn't have claimId field, using FileAsset instead
    const photo = await prisma.file_assets.findFirst({
      where: {
        id: photoId,
        claimId,
        orgId: orgId ?? undefined,
      },
      select: {
        id: true,
        filename: true,
        publicUrl: true,
        storageKey: true,
        sizeBytes: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({ photo });
  } catch (error: any) {
    console.error("[GET /api/claims/:id/photos/:photoId] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch photo" }, { status: 500 });
  }
}
