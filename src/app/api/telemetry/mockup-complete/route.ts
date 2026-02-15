export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { emitEvent, pushNotification, recordToolRun } from "@/lib/telemetry";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = (user.publicMetadata?.orgId as string) || user.id;
    const { mockupId, address, colorway, systemType, angles, tokensUsed } = await req.json();

    // Emit activity event
    await emitEvent({
      orgId,
      clerkUserId: user.id,
      kind: "mockup.generated",
      refType: "mockup",
      refId: mockupId,
      title: `AI Mockup generated${address ? ` for ${address}` : ""}`,
      meta: { colorway, systemType, angles },
    });

    // Push notification
    await pushNotification({
      orgId,
      clerkUserId: user.id,
      level: "success",
      title: "Mockup Ready",
      body: `Your ${colorway} ${systemType} mockup is ready to view.`,
      link: `/ai/mockup`,
    });

    // Record tool run
    await recordToolRun({
      orgId,
      clerkUserId: user.id,
      tool: "mockup",
      status: "success",
      tokensUsed: tokensUsed || 0,
      input: { address, colorway, systemType, angles },
      output: { mockupId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Mockup telemetry error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log mockup telemetry" },
      { status: 500 }
    );
  }
}
