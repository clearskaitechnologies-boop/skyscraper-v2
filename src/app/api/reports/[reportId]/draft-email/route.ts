// src/app/api/reports/[reportId]/draft-email/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { draftPacketEmail } from "@/lib/email/draftPacketEmail";
import type { PacketRecipientType } from "@/lib/email/types";
import { buildHomeownerSummaryPayload, buildReportAdjusterPayload } from "@/lib/export/payloads";

type RouteParams = { params: { reportId: string } };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reportId = params.reportId;
    const body = await req.json();
    const recipientType: PacketRecipientType = body.recipientType || "adjuster";

    // Build payload based on recipient type
    let payload: any;
    let packetUrl: string;

    if (recipientType === "adjuster") {
      payload = await buildReportAdjusterPayload(reportId, orgId ?? null);
      packetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com"}/exports/reports/${reportId}/adjuster`;
    } else {
      payload = await buildHomeownerSummaryPayload(reportId, orgId ?? null);
      packetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com"}/exports/reports/${reportId}/homeowner`;
    }

    if (!payload.claim) {
      return NextResponse.json({ error: "Report or claim not found" }, { status: 404 });
    }

    // Draft email using AI
    const draft = await draftPacketEmail({
      recipientType,
      claim: payload.claim,
      payload,
      packetType: "report",
      packetUrl,
    });

    return NextResponse.json({
      success: true,
      ...draft,
    });
  } catch (err) {
    console.error("Error drafting report email:", err);
    return NextResponse.json({ error: "Failed to draft email" }, { status: 500 });
  }
}
