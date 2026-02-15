export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// API: SAVE/LOAD REPORT DRAFT
// ============================================================================

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reportId = params.reportId;

    const draft = await prisma.report_drafts.findUnique({
      where: { report_id: reportId },
    });

    if (!draft) {
      return NextResponse.json({ error: "No draft found" }, { status: 404 });
    }

    return NextResponse.json(draft.draft_state);
  } catch (error: any) {
    console.error("[Draft GET]", error);
    return NextResponse.json({ error: error.message || "Failed to get draft" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reportId = params.reportId;
    const body = await req.json();
    const { draftState, sectionOrder } = body;

    await prisma.report_drafts.upsert({
      where: { report_id: reportId },
      create: {
        id: crypto.randomUUID(),
        report_id: reportId,
        user_id: userId,
        org_id: orgId || userId,
        draft_state: draftState || {},
        section_order: sectionOrder || [],
        last_autosave: new Date(),
        updated_at: new Date(),
      },
      update: {
        draft_state: draftState || {},
        section_order: sectionOrder || [],
        last_autosave: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Draft POST]", error);
    return NextResponse.json({ error: error.message || "Failed to save draft" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reportId = params.reportId;

    await prisma.report_drafts.delete({
      where: { report_id: reportId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Draft DELETE]", error);
    return NextResponse.json({ error: error.message || "Failed to delete draft" }, { status: 500 });
  }
}
