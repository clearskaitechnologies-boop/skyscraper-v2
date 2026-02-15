export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { safeAI } from "@/lib/aiGuard";
import prisma from "@/lib/prisma";

const appealRequestSchema = z.object({
  appealType: z.enum(["denial", "undervaluation", "bad_faith", "delay"]),
  reason: z.string().min(10),
  requestedAmount: z.number().optional(),
  supportingDocs: z.array(z.string()).optional(),
  additionalEvidence: z.string().optional(),
});

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function POST(req: Request, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claimId = params.claimId;
    const body = await req.json();

    // Validate input
    const validation = appealRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { appealType, reason, requestedAmount, supportingDocs, additionalEvidence } =
      validation.data;

    // Fetch claim with related data
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      include: {
        claim_analysis: true,
        claim_bad_faith_analysis: true,
        ai_reports: {
          where: { type: { in: ["claim_pdf", "rebuttal", "bad_faith"] } },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Build context for AI generation
    const context = {
      claim: {
        number: claim.claimNumber,
        title: claim.title,
        description: claim.description,
        damageType: claim.damageType,
        dateOfLoss: claim.dateOfLoss,
        carrier: claim.carrier,
        adjusterName: claim.adjusterName,
        adjusterEmail: claim.adjusterEmail,
        estimatedValue: claim.estimatedValue,
        approvedValue: claim.approvedValue,
        deductible: claim.deductible,
        status: claim.status,
        policyNumber: claim.policy_number,
      },
      analysis: claim.claim_analysis,
      badFaith: claim.claim_bad_faith_analysis,
      appealType,
      reason,
      requestedAmount,
      additionalEvidence,
      photoCount: 0,
      previousReports: claim.ai_reports?.map((r) => ({
        type: r.type,
        title: r.title,
        createdAt: r.createdAt,
      })),
    };

    // Generate appeal document using GPT-4o
    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json(
        {
          error:
            "AI is not configured on this environment (missing OPENAI_API_KEY). Please set it to enable appeal generation.",
        },
        { status: 503 }
      );
    }
    const systemPrompt = `You are an expert insurance claims attorney specializing in property damage appeals. Generate a comprehensive, professional appeal letter that:
1. Clearly identifies the claim and parties
2. States the grounds for appeal with legal precision
3. Cites relevant policy provisions and case law when applicable
4. Presents evidence methodically and persuasively
5. Calculates and justifies the requested amount
6. Maintains a professional but assertive tone
7. Includes specific next steps and deadlines

Format the output as a formal business letter with sections: Header, Introduction, Statement of Facts, Grounds for Appeal, Evidence Summary, Calculation/Justification, Conclusion, and Closing.`;

    const userPrompt = `Generate an appeal letter for the following claim:

CLAIM DETAILS:
- Claim Number: ${context.claim.number}
- Policy Number: ${context.claim.policyNumber || "Unknown"}
- Carrier: ${context.claim.carrier || "Unknown"}
- Date of Loss: ${new Date(context.claim.dateOfLoss).toLocaleDateString()}
- Property: ${context.claim.title}
- Damage Type: ${context.claim.damageType}
- Description: ${context.claim.description || "N/A"}

APPEAL TYPE: ${appealType.toUpperCase().replace("_", " ")}

REASON FOR APPEAL:
${reason}

FINANCIAL DETAILS:
- Original Estimate: $${context.claim.estimatedValue?.toLocaleString() || "N/A"}
- Approved Amount: $${context.claim.approvedValue?.toLocaleString() || "N/A"}
- Requested Amount: $${requestedAmount?.toLocaleString() || "Full coverage"}
- Deductible: $${context.claim.deductible?.toLocaleString() || "N/A"}

${
  context.badFaith
    ? `BAD FAITH INDICATORS:
Severity Score: ${context.badFaith.severity}/10
Analysis Available: Yes (include reference to bad faith analysis)`
    : ""
}

${
  context.analysis
    ? `TECHNICAL ANALYSIS AVAILABLE:
- Roof mapping and slope analysis
- Material assessment
- Damage documentation
- Code compliance review`
    : ""
}

EVIDENCE:
- Documented photos: ${context.photoCount}
- Previous reports filed: ${context.previousReports.length}
${additionalEvidence ? `- Additional evidence: ${additionalEvidence}` : ""}

${
  supportingDocs && supportingDocs.length > 0
    ? `ATTACHED DOCUMENTS:
${supportingDocs.map((doc) => `- ${doc}`).join("\n")}`
    : ""
}

Generate a compelling appeal letter addressing the ${appealType} issue with specific references to the claim data, evidence, and industry standards.`;

    const ai = await safeAI("claim-appeal", () =>
      client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 4000,
      })
    );

    if (!ai.ok) {
      return NextResponse.json({ error: ai.error }, { status: ai.status });
    }

    const completion = ai.result;
    const appealDocument = completion.choices[0]?.message?.content;

    if (!appealDocument) {
      return NextResponse.json({ error: "Failed to generate appeal document" }, { status: 502 });
    }

    // Log the appeal in ReportHistory
    const reportEntry = await prisma.ai_reports.create({
      data: {
        id: `appeal_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        orgId: claim.orgId,
        userId,
        userName: "User", // Required field
        claimId: claim.id,
        type: "appeal",
        title: `${appealType.replace("_", " ").toUpperCase()} Appeal - ${claim.claimNumber}`,
        content: appealDocument,
        tokensUsed: completion.usage?.total_tokens || 0,
        model: "gpt-4o",
        updatedAt: new Date(),
      },
    });

    console.info(
      `[API:CLAIM_APPEAL] Generated appeal for claim ${claimId}, report ${reportEntry.id}`
    );

    return NextResponse.json({
      success: true,
      document: appealDocument,
      reportId: reportEntry.id,
      metadata: {
        appealType,
        generatedAt: reportEntry.createdAt,
        claimNumber: claim.claimNumber,
        tokenUsage: completion.usage,
      },
    });
  } catch (error: any) {
    console.error("[API:CLAIM_APPEAL] Generation failed:", error);
    Sentry.captureException(error, {
      tags: { component: "claim-appeal-api", claimId: params.claimId },
    });
    return NextResponse.json(
      { error: error.message || "Failed to generate appeal" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claimId = params.claimId;

    // Fetch appeal history
    const appeals = await prisma.ai_reports.findMany({
      where: {
        claimId,
        type: "appeal",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        attachments: true,
      },
    });

    return NextResponse.json({ appeals });
  } catch (error: any) {
    console.error("[API:CLAIM_APPEAL] Fetch failed:", error);
    Sentry.captureException(error, {
      tags: { component: "claim-appeal-api-get", claimId: params.claimId },
    });
    return NextResponse.json(
      { error: error.message || "Failed to fetch appeals" },
      { status: 500 }
    );
  }
}
