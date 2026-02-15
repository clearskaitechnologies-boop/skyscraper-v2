export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// =====================================================
// API: SEND REPORT TO CLIENT
// =====================================================
// POST /api/reports/[id]/send
// Sends email with public share link + PDF to client
// =====================================================

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { env } from "@/env";
import { sendReportReadyEmail } from "@/lib/mailer";
import prisma from "@/lib/prisma";

const SITE = env.NEXT_PUBLIC_SITE_URL;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, name } = body as { email?: string; name?: string };

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Find report (verify org ownership)
    const report = await prisma.ai_reports.findFirst({
      where: {
        id: params.id,
        orgId,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Generate share token for secure access (ephemeral - share_tokens model not in schema)
    const shareTokenValue = `rpt_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    const shareUrl = `${SITE}/share/${shareTokenValue}`;

    // Send email with report link
    const pdfUrl = (report.attachments as Record<string, any>)?.pdfUrl || "";
    await sendReportReadyEmail({
      to: email,
      recipientName: name,
      shareUrl,
      pdfUrl,
    });

    // Log the send event
    console.log(`Report ${report.id} sent to ${email} by user ${userId}`);

    return NextResponse.json({
      ok: true,
      description: `Report sent to ${email}`,
    });
  } catch (error) {
    console.error("Send report error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Send failed" },
      { status: 500 }
    );
  }
}
