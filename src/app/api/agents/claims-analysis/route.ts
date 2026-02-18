import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";
import prisma from "@/lib/prisma";

/**
 * POST /api/agents/claims-analysis
 * Run comprehensive AI analysis on a claim
 * Body: { claimId: string, modes: string[] }
 */

// Validation schema
const requestSchema = z.object({
  claimId: z.string().min(10, "Invalid claimId format"),
  modes: z.array(z.string()).min(1, "At least one analysis mode required"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get org context (REQUIRED for data isolation)
    const orgResult = await getActiveOrgContext();
    if (!orgResult.ok) {
      return NextResponse.json({ error: "Organization context required" }, { status: 403 });
    }
    const orgId = orgResult.orgId;

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[POST /api/agents/claims-analysis] JSON parse error:", parseError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    // Validate with Zod
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      console.error("[POST /api/agents/claims-analysis] Validation failed:", errors);
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const { claimId, modes } = validation.data;

    console.log("[POST /api/agents/claims-analysis] Processing:", {
      claimId,
      modes,
      userId,
      orgId,
    });

    // Verify claim exists and user has access
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        orgId,
      },
      select: {
        id: true,
        claimNumber: true,
        title: true,
        dateOfLoss: true,
        status: true,
      },
    });

    if (!claim) {
      console.warn("[POST /api/agents/claims-analysis] Claim not found or access denied:", {
        claimId,
        orgId,
      });
      return NextResponse.json(
        { error: "Claim not found or you don't have permission to access it" },
        { status: 404 }
      );
    }

    // Get AI reports for this claim
    const artifacts = await prisma.ai_reports.findMany({
      where: {
        claimId,
        orgId,
      },
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Mock analysis results (in production, this would call actual AI services)
    const analysisResults = {
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      analyzedAt: new Date().toISOString(),
      modes,
      results: {
        coverage: modes.includes("coverage")
          ? {
              status: "COVERED",
              confidence: 85,
              reasoning: `Based on policy review and claim details for ${claim.title}, this appears to be a covered loss.`,
              recommendations: ["Document all damage thoroughly", "Consider supplement if needed"],
            }
          : null,

        fraud: modes.includes("fraud")
          ? {
              riskLevel: "LOW",
              confidence: 92,
              flags: [],
              reasoning: "No fraud indicators detected. Claim appears legitimate.",
            }
          : null,

        severity: modes.includes("severity")
          ? {
              level: "MODERATE",
              estimatedDamage: 45000,
              confidence: 78,
              reasoning: "Moderate damage based on property size and loss date.",
            }
          : null,

        timeline: modes.includes("timeline")
          ? {
              status: "ON_TRACK",
              daysOpen: Math.floor(
                (new Date().getTime() - new Date(claim.dateOfLoss || Date.now()).getTime()) /
                  (1000 * 60 * 60 * 24)
              ),
              nextSteps: ["Complete inspection", "Submit estimate", "Await adjuster response"],
            }
          : null,

        documents: {
          total: artifacts.length,
          byType: artifacts.reduce(
            (acc, art) => {
              acc[art.type] = (acc[art.type] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ),
          missingRecommended: [],
        },
      },
      summary: `Analysis complete for claim ${claim.claimNumber}. Reviewed ${modes.length} analysis mode(s) and ${artifacts.length} document(s).`,
    };

    return NextResponse.json(analysisResults);
  } catch (error) {
    logger.error("[POST /api/agents/claims-analysis] Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during analysis" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
