export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { ensureUserOrgContext } from "@/lib/auth/ensureUserOrgContext";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // CRITICAL FIX: Use unified org context (auto-creates if needed)
    const { orgId: finalOrgId } = await ensureUserOrgContext(userId);

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

    console.log("Branding upsert request:", {
      userId,
      finalOrgId,
      companyName,
      hasEmail: !!email,
    });

    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    logger.debug("Using finalOrgId:", finalOrgId);

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

    // Get detailed error info
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Detailed error:", {
      description: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : undefined,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
