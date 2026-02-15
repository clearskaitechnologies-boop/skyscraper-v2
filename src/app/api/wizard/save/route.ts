import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { upsertDraft, UpsertDraftPayload } from "@/lib/wizard";

export const dynamic = "force-dynamic";

/**
 * POST /api/wizard/save
 * Body: { draftId?: string, step: number, data: any }
 * Upsert a job wizard draft for the current user
 */
export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json()) as UpsertDraftPayload;

    if (typeof payload.step !== "number" || !payload.data) {
      return NextResponse.json(
        { error: "Invalid payload - step and data required" },
        { status: 400 }
      );
    }

    const draft = await upsertDraft(userId, orgId || null, payload);

    return NextResponse.json({
      ok: true,
      draft,
    });
  } catch (err: any) {
    console.error("Wizard save error:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}
