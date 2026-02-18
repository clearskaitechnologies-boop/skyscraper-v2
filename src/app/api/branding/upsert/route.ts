export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "@/lib/auth/withAuth";
import prisma from "@/lib/prisma";

export const POST = withAuth(async (req: NextRequest, { userId, orgId: finalOrgId }) => {
  try {
    const body = await req.json();
    const {
      companyName,
      license,
      phone,
      email,
      website,
      colorPrimary,
      colorAccent,
      logoUrl,
      teamPhotoUrl,
    } = body;

    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    const branding = await prisma.org_branding.upsert({
      where: {
        orgId: finalOrgId,
      },
      update: {
        companyName,
        license,
        phone,
        email,
        website,
        colorPrimary,
        colorAccent,
        logoUrl,
        teamPhotoUrl,
        updatedAt: new Date(),
      },
      create: {
        id: `${finalOrgId}_branding`,
        orgId: finalOrgId, // Always required
        ownerId: userId,
        companyName,
        license,
        phone,
        email,
        website,
        colorPrimary: colorPrimary || "#117CFF",
        colorAccent: colorAccent || "#FFC838",
        logoUrl,
        teamPhotoUrl,
        updatedAt: new Date(),
      },
    });

    logger.debug("Branding upsert successful:", branding.id);

    return NextResponse.json({ success: true, branding });
  } catch (error) {
    logger.error("Branding upsert error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
});
