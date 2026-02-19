export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, email, phone, website, colorPrimary, colorAccent, logoUrl, license } =
      body;

    // Get user's organization
    const user = await prisma.users.findUnique({
      where: { clerkUserId: userId },
      include: { Org: true },
    });

    if (!user?.orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    // Upsert organization branding
    const orgBranding = await prisma.org_branding.upsert({
      where: {
        orgId: user.orgId,
      },
      update: {
        companyName,
        email,
        phone,
        website,
        colorPrimary,
        colorAccent,
        logoUrl,
        license,
        updatedAt: new Date(),
      },
      create: {
        id: `${user.orgId}_branding`,
        orgId: user.orgId,
        ownerId: userId,
        companyName,
        email,
        phone,
        website,
        colorPrimary: colorPrimary || "#117CFF",
        colorAccent: colorAccent || "#FFC838",
        logoUrl,
        license,
        updatedAt: new Date(),
      },
    });

    // Check if branding is now complete
    const isComplete = orgBranding.companyName && orgBranding.email && orgBranding.colorPrimary;

    return NextResponse.json({
      success: true,
      branding: orgBranding,
      isComplete,
    });
  } catch (error) {
    logger.error("Error saving branding setup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const user = await prisma.users.findUnique({
      where: { clerkUserId: userId },
      include: { Org: true },
    });

    if (!user?.orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    // Get current branding data
    const orgBranding = await prisma.org_branding.findFirst({
      where: {
        orgId: user.orgId,
      },
    });

    return NextResponse.json({
      branding: orgBranding || {
        companyName: "",
        email: "",
        phone: "",
        website: "",
        colorPrimary: "#117CFF",
        colorAccent: "#FFC838",
        logoUrl: "",
        license: "",
      },
    });
  } catch (error) {
    logger.error("Error fetching branding setup:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
