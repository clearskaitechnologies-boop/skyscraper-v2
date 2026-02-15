import { NextRequest, NextResponse } from "next/server";

import { getPortalClaim } from "@/lib/portal/portal-auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: { claimId: string; fileId: string };
  }
) {
  try {
    const { claimId, fileId } = params;
    const { userId } = await getPortalClaim(claimId);

    const { body } = (await req.json()) as { body?: string };

    if (!body || !body.trim()) {
      return new NextResponse("Message body is required", { status: 400 });
    }

    // Make sure file belongs to this claim
    const file = await prisma.file_assets.findFirst({
      where: {
        id: fileId,
        claimId,
      },
      select: { id: true, filename: true, orgId: true },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Create file comment using the ClaimFileComment model
    const comment = await prisma.claimFileComment.create({
      data: {
        fileId,
        claimId,
        authorId: userId,
        authorType: "client",
        body: body.trim(),
      },
    });

    // Notify the pros assigned to this claim
    const orgUsers = await prisma.user_organizations.findMany({
      where: {
        organizationId: file.orgId,
        role: { in: ["OWNER", "ADMIN", "MEMBER"] },
      },
      select: { userId: true },
    });

    // Create notifications for all org members
    await Promise.allSettled(
      orgUsers.map((ou) =>
        prisma.tradeNotification.create({
          data: {
            recipientId: ou.userId,
            type: "file_comment_added",
            title: "Client commented on a document",
            message: `New comment on "${file.filename}"`,
            actionUrl: `/claims/${claimId}`,
            metadata: { claimId, fileId: file.id },
          },
        })
      )
    );

    return NextResponse.json({
      comment: {
        id: comment.id,
        body: comment.body,
        authorRole: "CLIENT",
        createdAt: comment.createdAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("[PORTAL_FILE_COMMENT_POST_ERROR]", error);

    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHENTICATED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (message === "FORBIDDEN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return new NextResponse("Internal Error", { status: 500 });
  }
}
