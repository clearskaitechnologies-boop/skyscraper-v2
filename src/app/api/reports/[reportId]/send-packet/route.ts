// src/app/api/reports/[id]/send-packet/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { sendPacketEmail } from "@/lib/email/sendPacketEmail";
import type { SendPacketRequestBody } from "@/lib/email/types";
import prisma from "@/lib/prisma";

type RouteParams = { params: { id: string } };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reportId = params.id;
    const body: SendPacketRequestBody = await req.json();
    const { to, cc, subject, message, recipientType } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, message" },
        { status: 400 }
      );
    }

    // Load report with claim
    const report = await prisma.ai_reports.findFirst({
      where: {
        id: reportId,
        orgId: orgId ?? undefined,
      },
      include: {
        claims: true,
      },
    });

    if (!report || !report.claims) {
      return NextResponse.json({ error: "Report or claim not found" }, { status: 404 });
    }

    // Determine packet URL
    const packetUrl =
      recipientType === "adjuster"
        ? `${process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com"}/exports/reports/${reportId}/adjuster`
        : `${process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com"}/exports/reports/${reportId}/homeowner`;

    // Send email
    const emailResult = await sendPacketEmail({
      to,
      cc,
      subject,
      message,
      packetUrl,
    });

    if (!emailResult || "skipped" in emailResult) {
      return NextResponse.json({ error: "Email sending failed or was skipped" }, { status: 500 });
    }

    // Update claim fields
    const updateData: any = {
      lastContactedAt: new Date(),
    };

    if (recipientType === "adjuster" && to) {
      updateData.adjusterEmail = to;
      updateData.adjusterPacketSentAt = new Date();
    } else if (recipientType === "homeowner" && to) {
      updateData.homeownerEmail = to;
      updateData.homeownerSummarySentAt = new Date();
    }

    await prisma.claims.update({
      where: { id: report.claims.id },
      data: updateData,
    });

    // Create timeline event
    await prisma.claim_timeline_events.create({
      data: {
        id: crypto.randomUUID(),
        claim_id: report.claims.id,
        org_id: orgId ?? report.claims.orgId,
        actor_id: userId,
        actor_type: "user",
        type: "email_sent",
        description: `Report packet sent to ${recipientType}\nSubject: ${subject}\nTo: ${to}${cc ? `\nCC: ${cc}` : ""}\n\n${message.substring(0, 200)}${message.length > 200 ? "..." : ""}`,
        metadata: {
          kind: "report_packet",
          recipientType,
          to,
          cc,
          subject,
          reportId,
          packetUrl,
        },
      },
    });

    return NextResponse.json({
      success: true,
      emailResult,
    });
  } catch (err) {
    console.error("Error sending report email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
