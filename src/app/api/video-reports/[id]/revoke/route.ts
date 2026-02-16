/**
 * 🔥 PHASE 27.2a: REVOKE VIDEO SHARE
 *
 * POST /api/video-reports/[id]/revoke
 * Revokes public access to video report
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Prisma singleton imported from @/lib/db/prisma

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const Org = await prisma.org.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!Org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const reportId = params.id;

    // Verify report exists and belongs to Org
    const report = await prisma.ai_reports.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.orgId !== Org.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Revoke public access - set status to 'revoked'
    await prisma.ai_reports.update({
      where: { id: reportId },
      data: {
        status: "revoked",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Share link revoked",
    });
  } catch (error: any) {
    logger.error("Error revoking video share:", error);
    return NextResponse.json(
      { error: "Failed to revoke share link", details: error.message },
      { status: 500 }
    );
  }
}
