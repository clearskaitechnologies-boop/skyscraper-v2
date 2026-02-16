// Pro-side API to toggle file visibility in portal
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * PATCH /api/claims/[claimId]/files/[fileId]
 * Allows pros to toggle visibleToClient flag on claim documents
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { claimId: string; fileId: string } }
) {
  try {
    const { claimId, fileId } = params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { visibleToClient } = body as { visibleToClient?: boolean };

    if (typeof visibleToClient !== "boolean") {
      return new NextResponse("visibleToClient must be boolean", {
        status: 400,
      });
    }

    // Note: documents model doesn't have claimId, using FileAsset instead
    // FileAsset also doesn't have visibleToClient field - stub response
    const file = await prisma.file_assets.findFirst({
      where: {
        id: fileId,
        claimId,
      },
      select: {
        id: true,
        orgId: true,
      },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Update client visibility
    await prisma.file_assets.update({
      where: { id: fileId },
      data: { visibleToClient },
    });

    return NextResponse.json({
      id: file.id,
      visibleToClient,
      message: `File visibility ${visibleToClient ? "enabled" : "disabled"} for client portal`,
    });
  } catch (error) {
    logger.error("[CLAIM_FILE_PATCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
