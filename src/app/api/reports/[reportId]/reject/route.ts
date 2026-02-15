export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// API: REJECT AI FIELDS
// ============================================================================
// POST /api/reports/[id]/reject
// Body: { sectionKey, fieldIds?: string[] }
// Clears AI fields (sets value to empty, aiGenerated: false)

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getAISection, saveAISection } from "@/modules/ai/jobs/persist";
import type { AISectionKey } from "@/modules/ai/types";
import { logAction } from "@/modules/audit/core/logger";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const userName = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : "Unknown";

    const reportId = params.id;
    const body = await req.json();
    const { sectionKey, fieldIds } = body as {
      sectionKey: AISectionKey;
      fieldIds?: string[];
    };

    if (!sectionKey) {
      return NextResponse.json({ error: "sectionKey required" }, { status: 400 });
    }

    // Get current section state
    const state = await getAISection(reportId, sectionKey);
    if (!state) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Reject fields (clear values)
    const updatedFields: Record<string, any> = {};
    for (const [fieldId, field] of Object.entries(state.fields)) {
      // If fieldIds provided, only reject those
      if (fieldIds && !fieldIds.includes(fieldId)) {
        updatedFields[fieldId] = field;
        continue;
      }
      // Clear AI-generated fields
      if ((field as any).aiGenerated) {
        updatedFields[fieldId] = {
          ...(field as any),
          value: "",
          aiGenerated: false,
          approved: false,
          confidence: undefined,
          source: undefined,
        };
      } else {
        updatedFields[fieldId] = field;
      }
    }

    // Save updated state
    await saveAISection(reportId, sectionKey, {
      ...state,
      fields: updatedFields,
    });

    // Log AI rejection
    if (orgId) {
      await logAction({
        orgId,
        userId,
        userName,
        action: "AI_REJECT",
        metadata: {
          section: sectionKey,
          fieldCount:
            fieldIds?.length ||
            Object.keys(state.fields).filter((k) => state.fields[k].aiGenerated).length,
        },
      }).catch((err) => console.warn("[Reject] Failed to log action:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Reject API]", error);
    return NextResponse.json({ error: error.message || "Failed to reject" }, { status: 500 });
  }
}
