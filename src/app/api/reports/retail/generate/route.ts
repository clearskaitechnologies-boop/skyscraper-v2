import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { callOpenAI } from "@/lib/ai/client";
import { requirePermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/ratelimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const retailSchema = z.object({
  leadId: z.string(),
  claimId: z.string().nullable().optional(),
  scope: z.string().min(10),
  upsell: z.string().min(5),
});

interface RetailProposalData {
  summary: string;
  lineItems: Array<{ item: string; description: string; estimatedCost: string }>;
  upsellRecommendations: string[];
  valueJustification: string[];
  timelineEstimate: string;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Rate limit & permission
    const identifier = getClientIdentifier(req, userId || undefined);
    const rl = await checkRateLimit(identifier, "api");
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    await requirePermission("use_ai_features");

    const body = await req.json();
    const validated = retailSchema.parse(body);

    const lead = await prisma.leads.findFirst({
      where: { id: validated.leadId, orgId },
      select: { id: true, title: true, stage: true, source: true },
    });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    let claim: { id: string; claimNumber: string; damageType: string } | null = null;
    if (validated.claimId) {
      claim = await prisma.claims.findFirst({
        where: { id: validated.claimId, orgId },
        select: { id: true, claimNumber: true, damageType: true },
      });
    }

    const prompt = `You are a construction proposal generation assistant. Create a structured retail project proposal.
LEAD: ${lead.title || lead.id} (Status: ${lead.stage || "n/a"}, Source: ${lead.source || "n/a"})
${claim ? `RELATED CLAIM: ${claim.claimNumber || claim.id} • ${claim.damageType || "Damage"}` : ""}
SCOPE: ${validated.scope}
UPSELL TARGETS: ${validated.upsell}

Return JSON with keys:
summary (200-300 word executive overview)
lineItems (array of {item, description, estimatedCost}) focusing on scope
upsellRecommendations (array of strings)
valueJustification (3-5 bullet points why owner should proceed now)
timelineEstimate (short string e.g. "14 business days")
`;

    const result = await callOpenAI<RetailProposalData>({
      tag: "retail_proposal_builder",
      model: "gpt-4o",
      system:
        "You generate concise, trustworthy construction proposals with clear scope, pricing rationale and upsell opportunities.",
      messages: [{ role: "user", content: prompt }],
      parseJson: true,
      maxTokens: 2200,
      temperature: 0.55,
      context: { leadId: lead.id, claimId: claim?.id || null },
    });

    if (!result.success) throw new Error(result.error || "AI generation failed");
    const data = result.data;

    await prisma.ai_reports
      .create({
        data: {
          id: crypto.randomUUID(),
          orgId,
          userId,
          claimId: claim?.id || null,
          type: "retail_proposal",
          title: `Retail Proposal for ${lead.title || lead.id}`,
          content: JSON.stringify(data),
          tokensUsed: result.tokensUsed || 0,
          model: "gpt-4",
          userName: "System",
          updatedAt: new Date(),
          attachments: {
            leadId: lead.id,
            lineItemCount: data.lineItems?.length || 0,
            hasUpsell: (data.upsellRecommendations?.length || 0) > 0,
          },
        },
      })
      .catch((e) => console.error("[Retail Proposal] ReportHistory error", e));

    return NextResponse.json({
      ...data,
      generatedAt: new Date().toISOString(),
      leadId: lead.id,
      claimId: claim?.id || null,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[Retail Proposal API] Error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
