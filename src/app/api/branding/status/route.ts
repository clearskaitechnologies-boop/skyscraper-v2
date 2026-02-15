import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    let effectiveUserId = userId;
    let user = null as any;

    if (!effectiveUserId) {
      // Dev-only fallback to facilitate local status checks without Clerk session
      if (process.env.DEV_BRANDING_AUTOFALLBACK === "1") {
        // Select first user; rely on orgId check below to validate presence
        user = await prisma.users.findFirst({
          select: { id: true, clerkUserId: true, orgId: true, Org: { select: { id: true } } },
        });
        if (user?.orgId) {
          effectiveUserId = user.clerkUserId;
        }
      } else if (process.env.LOCAL_BRANDING_TEST_USER) {
        user = await prisma.users.findUnique({
          where: { clerkUserId: process.env.LOCAL_BRANDING_TEST_USER },
          include: { Org: true },
        });
        effectiveUserId = user?.clerkUserId;
      }
      if (!effectiveUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (!user) {
      user = await prisma.users.findUnique({
        where: { clerkUserId: effectiveUserId },
        include: { Org: true },
      });
    }

    if (!user?.orgId) {
      return NextResponse.json({
        isComplete: false,
        description: "No organization found",
      });
    }

    // Check if organization branding exists and is complete
    const orgBranding = await prisma.org_branding.findFirst({
      where: {
        orgId: user.orgId,
      },
    });

    // Define what constitutes "complete" branding
    const isComplete =
      orgBranding && orgBranding.companyName && orgBranding.colorPrimary && orgBranding.email;

    return NextResponse.json({
      isComplete: !!isComplete,
      branding: orgBranding,
      requirements: {
        companyName: !!orgBranding?.companyName,
        email: !!orgBranding?.email,
        colors: !!orgBranding?.colorPrimary,
        logo: !!orgBranding?.logoUrl,
      },
    });
  } catch (error) {
    console.error("Error checking branding status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
