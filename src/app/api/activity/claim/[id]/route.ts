// MODULE 3: Activity Feed - Get claim activity
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getClaimActivity } from "@/lib/activity";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const claimId = params.id;

  try {
    // Determine user role and verify access
    const proUser = await prisma.users.findFirst({
      where: { clerkUserId: userId },
      select: { id: true, orgId: true },
    });

    let viewerRole: "pro" | "client" = "client";

    if (proUser) {
      // Pro user - verify they own this claim's org
      const claim = await prisma.claims.findUnique({
        where: { id: claimId },
        select: { orgId: true },
      });

      if (!claim || claim.orgId !== proUser.orgId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      viewerRole = "pro";
    } else {
      // Client user - check via client_access (email-based)
      // TODO: client_access model uses email, not clerkUserId
      // For now, reject non-pro users
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const activities = await getClaimActivity(claimId);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("[ACTIVITY_GET]", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
