import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { buildAdjusterPacketPayload } from "@/lib/export/payloads";

type RouteParams = { params: { id: string } };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reportId = params.id;
    const payload = await buildAdjusterPacketPayload(reportId as any, orgId as any);

    const fileName = `adjuster-packet-${reportId}.json`;

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("Error exporting adjuster JSON:", err);
    return NextResponse.json({ error: "Failed to export adjuster packet." }, { status: 500 });
  }
}
