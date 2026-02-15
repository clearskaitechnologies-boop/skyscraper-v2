/**
 * MASTER PROMPT #42 - REBUTTAL BUILDER API
 * POST /api/claims/[claimId]/rebuttal-builder
 *
 * Generates comprehensive rebuttal package with:
 * - AI-generated rebuttal letter
 * - Pre-supplement item suggestions with vendor specs
 * - Appeal report outline
 * - Legal citations
 * - Recommended attachments
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { callOpenAI } from "@/lib/ai/client";
import { requirePermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/ratelimit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const rebuttalRequestSchema = z.object({
  denialReason: z.string().min(10, "Denial reason must be at least 10 characters"),
  denialDetails: z.string().optional(),
  tone: z.enum(["professional", "firm", "legal"]).default("professional"),
});

/**
 * Generate AI-powered rebuttal package
 */
export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = rebuttalRequestSchema.parse(body);
    const { claimId } = params;

    // Rate limit (general API bucket) based on userId fallback to IP
    const identifier = getClientIdentifier(req, userId);
    const rl = await checkRateLimit(identifier, "api");
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Permission enforcement for AI usage
    await requirePermission("use_ai_features");

    // 1. Fetch claim data with related information
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
      include: {
        properties: {
          select: {
            street: true,
            city: true,
            state: true,
            carrier: true,
            policyNumber: true,
          },
        },
        claim_supplements: {
          orderBy: { created_at: "desc" },
          take: 5,
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // 2. Fetch vendor product data (normalized to prior expected shape)
    const rawProducts = await prisma.vendorProduct
      .findMany({
        select: {
          id: true,
          name: true,
          spec: true,
          warranty: true,
        },
        take: 50,
      })
      .catch(
        (): { id: string; name: string; spec: string | null; warranty: string | null }[] => []
      );

    const vendorData = rawProducts.map((p) => ({
      materialName: p.name,
      quickBuildCode: p.id,
      specification: p.spec,
      unitPrice: 0,
      category: "general",
    }));

    // 3. Build AI prompt with comprehensive context
    const prompt = `You are an expert insurance claims advocate. Generate a comprehensive rebuttal package for a carrier denial.

CLAIM INFORMATION:
- Claim #${claim.claimNumber}
- Property: ${claim.properties?.street || "N/A"}, ${claim.properties?.city || "N/A"}, ${claim.properties?.state || "N/A"}
- Carrier: ${claim.properties?.carrier || "Unknown"}
- Policy #: ${claim.properties?.policyNumber || "N/A"}
- Loss Date: ${claim.dateOfLoss ? new Date(claim.dateOfLoss).toLocaleDateString() : "N/A"}
- Damage Type: ${claim.damageType || "N/A"}

DENIAL REASON:
${validated.denialReason}

${validated.denialDetails ? `ADDITIONAL CONTEXT:\n${validated.denialDetails}\n` : ""}

AVAILABLE MATERIALS/VENDOR DATA:
${
  vendorData && vendorData.length > 0
    ? vendorData
        .slice(0, 10)
        .map(
          (v) =>
            `- ${v.materialName} (${v.quickBuildCode}) - $${v.unitPrice} - ${v.specification || "Standard spec"}`
        )
        .join("\n")
    : "Standard industry materials"
}

RESPONSE TONE: ${validated.tone}

Generate a JSON response with the following structure:
{
  "rebuttal": "Professional rebuttal letter (400-600 words) addressing the denial reason with factual arguments, policy references, and industry standards",
  "preSupplement": [
    {
      "item": "Missing line item name",
      "justification": "Why this item should be included",
      "estimatedCost": 1500,
      "vendorSpec": "Specific material specification or code"
    }
  ],
  "appealOutline": [
    {
      "section": "Executive Summary",
      "content": "Brief overview of appeal position",
      "strength": "strong|moderate|weak"
    },
    {
      "section": "Policy Coverage Analysis",
      "content": "Specific policy language citations",
      "strength": "strong|moderate|weak"
    },
    {
      "section": "Evidence & Documentation",
      "content": "Photos, reports, expert opinions",
      "strength": "strong|moderate|weak"
    },
    {
      "section": "Code & Industry Standards",
      "content": "IRC, manufacturer specs, best practices",
      "strength": "strong|moderate|weak"
    },
    {
      "section": "Conclusion & Request",
      "content": "Clear call to action",
      "strength": "strong|moderate|weak"
    }
  ],
  "legalCitations": [
    "IRC 2021 R905.2.8.5 - Underlayment requirements",
    "ASTM D6381 - Shingle impact resistance",
    "Policy Section 4.2 - Covered perils"
  ],
  "recommendedAttachments": [
    "Storm data report (NOAA)",
    "Professional inspection photos",
    "Material manufacturer specifications",
    "Previous supplement history"
  ]
}

Guidelines:
1. Be ${validated.tone} but factual and evidence-based
2. Cite specific policy language when possible
3. Reference industry standards (IRC, ASTM, NRCA)
4. Suggest 3-5 pre-supplement items that directly address denial
5. Include vendor-specific material specs when applicable
6. Structure appeal outline with 5 logical sections
7. Rate section strength based on available evidence
8. Keep rebuttal concise but comprehensive`;

    // 4. Call OpenAI
    const result = await callOpenAI({
      tag: "rebuttal_builder",
      model: "gpt-4o",
      system: `You are an expert insurance claims advocate specializing in carrier denial rebuttals. You write compelling, evidence-based arguments that maximize claim approval chances while maintaining professionalism.`,
      messages: [{ role: "user", content: prompt }],
      parseJson: true,
      maxTokens: 2500,
      temperature: 0.7,
      context: { claimId, denialReason: validated.denialReason },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: `AI generation failed: ${result.error || "Unknown error"}` },
        { status: 502 }
      );
    }

    const rebuttalPackage = result.data as Record<string, unknown>;

    // H-9: Track AI credit usage
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/usage/increment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId: claim.orgId,
            metricType: "ai_credits",
            amount: 1,
          }),
        }
      );
    } catch (usageError) {
      console.warn("[Rebuttal Builder] Usage tracking failed:", usageError);
    }

    // 5. Save to ai_reports for history display
    try {
      await prisma.ai_reports.create({
        data: {
          id: crypto.randomUUID(),
          orgId,
          userId,
          userName: userId, // Will be resolved by UI
          claimId,
          type: "rebuttal",
          title: `Rebuttal: ${validated.denialReason.substring(0, 50)}`,
          prompt: validated.denialReason,
          content: JSON.stringify(rebuttalPackage),
          tokensUsed: result.tokensUsed || 0,
          model: "gpt-4o",
          status: "completed",
          updatedAt: new Date(),
        },
      });
    } catch (dbErr) {
      console.error("[REBUTTAL BUILDER] Failed to save ai_reports:", dbErr);
      // Non-blocking - continue to return result
    }

    // 6. Return complete package
    return NextResponse.json({
      ...rebuttalPackage,
      tone: validated.tone,
      generatedAt: new Date().toISOString(),
      claimId,
    });
  } catch (error: unknown) {
    console.error(`[POST /api/claims/${params.claimId}/rebuttal-builder] Error:`, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate rebuttal" },
      { status: 500 }
    );
  }
}
