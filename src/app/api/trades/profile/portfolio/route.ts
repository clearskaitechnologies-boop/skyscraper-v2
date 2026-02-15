import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { portfolioUrls } = body;

    if (!Array.isArray(portfolioUrls)) {
      return NextResponse.json({ error: "portfolioUrls must be an array" }, { status: 400 });
    }

    // NOTE: tradesCompanyMember doesn't have portfolioUrls field yet
    // For now, update onboarding status and return success
    let tradeProfile = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
    });

    if (!tradeProfile) {
      tradeProfile = await prisma.tradesCompanyMember.create({
        data: {
          id: crypto.randomUUID(),
          userId,
        },
      });
    }

    // Update member onboarding status to complete
    await prisma.tradesCompanyMember.updateMany({
      where: { userId },
      data: {
        onboardingStep: "complete",
      },
    });

    return NextResponse.json({ success: true, profile: tradeProfile });
  } catch (error) {
    console.error("Portfolio save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
