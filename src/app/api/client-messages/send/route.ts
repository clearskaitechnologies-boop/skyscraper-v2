import { auth, currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { claimId, body } = await req.json();

    if (!claimId || !body) {
      return new NextResponse("Missing claimId or body", { status: 400 });
    }

    // Determine sender type from role
    const role = (user.publicMetadata?.role as string) || "pro";
    const senderType = role === "client" ? "client" : "contractor";
    const email = user.emailAddresses[0]?.emailAddress;

    // Verify access to this claim
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { id: true, orgId: true, clientId: true },
    });

    if (!claim) {
      return new NextResponse("Claim not found", { status: 404 });
    }

    // If client, verify they have access
    if (senderType === "client") {
      if (!email) {
        return new NextResponse("Client email required", { status: 400 });
      }

      // Check client_access (uses email directly, no 'client' relation or orgId)
      const access = await prisma.client_access.findFirst({
        where: {
          email,
          claimId,
        },
      });

      if (!access) {
        return new NextResponse("Access denied", { status: 403 });
      }
    }

    // Find or create a portal thread for this claim
    let thread = await prisma.messageThread.findFirst({
      where: { claimId, isPortalThread: true },
    });

    if (!thread) {
      thread = await prisma.messageThread.create({
        data: {
          id: crypto.randomUUID(),
          orgId: claim.orgId,
          claimId,
          isPortalThread: true,
          subject: "Client Portal Discussion",
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        threadId: thread.id,
        senderUserId: userId,
        senderType,
        body,
        fromPortal: senderType === "client",
      },
    });

    // Update thread timestamp
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    logger.error("Error sending message:", error);
    return new NextResponse(error?.message || "Internal server error", {
      status: 500,
    });
  }
}
