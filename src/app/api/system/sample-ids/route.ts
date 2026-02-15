export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * INTERNAL TESTING ENDPOINT
 * Returns sample IDs for smoke testing
 */

export async function GET() {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    const orgId = authResult?.orgId;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    }

    // Get first claim for this org
    const claim = await prisma.claims.findFirst({
      where: { orgId },
      select: { id: true, claimNumber: true },
      orderBy: { createdAt: "desc" },
    });

    if (!claim) {
      return NextResponse.json(
        { error: "NO_CLAIMS", message: "No claims found for this organization" },
        { status: 404 }
      );
    }

    // Get first marketplace template
    const template = await prisma.template.findFirst({
      where: { isPublished: true },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    });

    if (!template) {
      return NextResponse.json(
        { error: "NO_TEMPLATES", message: "No published templates found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      templateId: template.id,
      templateTitle: template.name,
    });
  } catch (error) {
    console.error("[SAMPLE_IDS] Error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
