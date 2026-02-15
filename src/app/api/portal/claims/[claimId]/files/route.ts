// Portal API to list shared documents
import { NextRequest, NextResponse } from "next/server";

import { getPortalClaim } from "@/lib/portal/portal-auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/portal/claims/[claimId]/files
 * Returns all documents marked isPublic for this claim
 */
export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { claimId } = params;

    // Validates portal user has access to this claim
    const { claim } = await getPortalClaim(claimId);

    // If claim has no projectId, return empty files
    if (!claim?.projectId) {
      return NextResponse.json({ files: [] });
    }

    // Fetch all documents shared with client (isPublic = true)
    const files = await prisma.documents.findMany({
      where: {
        projectId: claim.projectId,
        isPublic: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        url: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        createdBy: true,
      },
    });

    // Map to expected format
    return NextResponse.json({
      files: files.map((f) => ({
        id: f.id,
        type: f.type,
        title: f.title,
        description: f.description,
        publicUrl: f.url,
        mimeType: f.mimeType,
        fileSize: f.sizeBytes,
        createdAt: f.createdAt,
        uploadedByRole: f.createdBy ? "pro" : "system",
      })),
    });
  } catch (error: any) {
    console.error("[PORTAL_FILES_GET_ERROR]", error);

    if (error.message === "UNAUTHENTICATED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (error.message === "FORBIDDEN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return new NextResponse("Internal Error", { status: 500 });
  }
}
