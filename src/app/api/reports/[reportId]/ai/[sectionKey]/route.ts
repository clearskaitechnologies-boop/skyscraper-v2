export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// API: GET AI SECTION STATE
// ============================================================================
// GET /api/reports/[id]/ai/[sectionKey]
// Returns: AISectionState for the given section

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { runReportBuilder } from "@/lib/report-engine/ai";
import { buildPayloadWithAddons } from "@/lib/report-engine/buildMasterPayload";
import { getAISection } from "@/modules/ai/jobs/persist";
import type { AISectionKey } from "@/modules/ai/types";

// Simple prompts for retail wizard section suggestions
const SIMPLE_SECTION_PROMPTS: Record<string, string> = {
  baseline:
    "Summarize property baseline: location context, known pre-loss condition, and claim context in 3-5 concise sentences.",
  damageSummary:
    "Create a homeowner-friendly damage summary highlighting major observed issues and urgency factors.",
  measurements:
    "List key measurement data points typically needed for a retail proposal (roof squares, pitch, elevations, interior spaces).",
  materials:
    "Provide recommended material upgrades: good/better/best with warranty or performance notes.",
  investmentTiers:
    "Draft Essential / Recommended / Premium tier breakdown with value justification.",
  timeline:
    "Outline a phased timeline (prep, removal, installation, finishes) with approximate durations.",
  insuranceAlignment:
    "Explain how proposed scope aligns with carrier standards and policy language without sounding adversarial.",
};

export async function GET(
  req: NextRequest,
  { params }: { params: { reportId: string; sectionKey: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reportId = params.reportId;
    const sectionKey = params.sectionKey as AISectionKey;

    const state = await getAISection(reportId, sectionKey);

    if (!state) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json(state);
  } catch (error) {
    logger.error("[AI Section API]", error);
    return NextResponse.json({ error: error.message || "Failed to get section" }, { status: 500 });
  }
}

// POST: Generate AI suggestion for section (retail wizard support)
export async function POST(
  req: Request,
  { params }: { params: { reportId: string; sectionKey: string } }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId, sectionKey } = params;
    const key = sectionKey as string;

    const basePrompt = SIMPLE_SECTION_PROMPTS[key];
    if (!basePrompt) {
      return NextResponse.json({ error: "Unknown section key" }, { status: 400 });
    }

    // Check if report exists (but skip creation to avoid schema mismatch)
    const report = await prisma.ai_reports
      .findUnique({ where: { id: reportId }, select: { id: true } })
      .catch(() => null);
    if (!report) {
      // Report doesn't exist yet - this is okay for draft suggestions
      logger.debug(`[AI Section] No existing report ${reportId}, generating suggestion anyway`);
    }

    // Build payload for report generation
    const payload = await buildPayloadWithAddons(reportId, {}, orgId);

    // Generate report content using the AI engine
    const aiContent = await runReportBuilder({
      claimId: reportId,
      reportType: "RETAIL_PROPOSAL",
      audience: "HOMEOWNER",
      addonPayload: payload ?? {},
      address: "Unknown", // Address comes from internal collector
      roofType: undefined,
      lossType: undefined,
      orgId,
    }).catch(() => null);

    // Extract content from GeneratedReport (executiveSummary or first section)
    const content =
      aiContent?.executiveSummary ||
      aiContent?.sections?.[0]?.content ||
      "(Suggestion temporarily unavailable)";
    return NextResponse.json({ sectionKey: key, content });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Internal error";
    logger.error("[AI Section Suggest] Failure", e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
