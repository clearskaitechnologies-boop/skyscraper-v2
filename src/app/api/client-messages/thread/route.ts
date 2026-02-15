import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const claimId = searchParams.get("claimId");

    if (!claimId) {
      return new NextResponse("Missing claimId", { status: 400 });
    }

    // Determine user role
    const role = (user.publicMetadata?.role as string) || "pro";
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
    if (role === "client") {
      if (!email) {
        return new NextResponse("Client email required", { status: 400 });
      }

      // client_access uses email directly, no 'client' relation or orgId
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

    // Get messages for this claim from portal threads
    const threads = await prisma.messageThread.findMany({
      where: {
        claimId,
        isPortalThread: true,
      },
      include: {
        Message: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            senderType: true,
            senderUserId: true,
            body: true,
            createdAt: true,
          },
        },
      },
    });

    // Flatten messages from all threads
    const messages = threads.flatMap((t) => t.Message);

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return new NextResponse(error?.message || "Internal server error", {
      status: 500,
    });
  }
}
