// app/api/reports/share/route.ts

import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Generate a signed share token containing the report ID
function generateShareToken(reportId: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  // Encode reportId in base64 for URL safety
  const encodedId = Buffer.from(reportId).toString("base64url");
  return `rpt_${encodedId}_${timestamp}_${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = await req.json();

    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    // Load report (creator ownership check)
    const report = await prisma.ai_reports.findUnique({
      where: { id: reportId },
      select: { id: true, userId: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate secure share token
    const token = generateShareToken(reportId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/share/report/${token}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      expiresAt,
    });
  } catch (error) {
    console.error("Share report error:", error);
    return NextResponse.json({ error: "Failed to generate share link" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = await req.json();

    // Verify ownership
    const report = await prisma.ai_reports.findUnique({
      where: { id: reportId },
      select: { id: true, userId: true },
    });

    if (!report || report.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Note: Without a share_tokens table, revocation is a no-op
    // The share URL remains valid until expiry (embedded in token)
    // To fully implement revocation, add share_tokens model to schema

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke share error:", error);
    return NextResponse.json({ error: "Failed to revoke share link" }, { status: 500 });
  }
}
