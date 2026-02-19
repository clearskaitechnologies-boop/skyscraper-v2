export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth, currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { emitEvent, pushNotification, recordToolRun } from "@/lib/telemetry";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId, leadId, jobId, leadName, tokensUsed } = await req.json();

    const orgId = (user.publicMetadata?.orgId as string) || user.id;

    // Emit activity event
    await emitEvent({
      orgId,
      clerkUserId: user.id,
      kind: "wizard.completed",
      refType: "report",
      refId: reportId,
      title: `Claim packet created${leadName ? ` for ${leadName}` : ""}`,
      meta: { leadId, jobId },
    });

    // Push success notification
    await pushNotification({
      orgId,
      clerkUserId: user.id,
      level: "success",
      title: "Claim packet ready",
      body: "Your claim packet has been generated. Review and export when ready.",
      link: `/reports/${reportId}`,
    });

    // Record tool run
    await recordToolRun({
      orgId,
      clerkUserId: user.id,
      tool: "claims_wizard",
      status: "success",
      tokensUsed: tokensUsed || 0,
      input: { leadId, jobId },
      output: { reportId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Failed to log wizard completion:", error);
    return NextResponse.json({ error: "Failed to log completion" }, { status: 500 });
  }
}
