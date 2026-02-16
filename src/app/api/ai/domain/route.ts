/**
 * Domain Adaptation AI Endpoint
 *
 * POST /api/ai/domain
 *
 * Specialized endpoint for domain adaptation tasks:
 * - Domain alignment
 * - Transfer learning
 * - Feature adaptation
 * - Cross-domain generalization
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { AICoreRouter } from "@/lib/ai/router";
import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";

async function POST_INNER(request: NextRequest, ctx: { userId: string; orgId: string }) {
  try {
    const { userId } = ctx;

    const body = await request.json();
    const { action = "align", payload } = body;

    // Validate payload
    if (!payload || (!payload.source && !payload.target)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing source or target domain data in payload.",
          required: {
            source: "Source domain data",
            target: "Target domain data",
          },
        },
        { status: 400 }
      );
    }

    // Route to appropriate domain task
    const task = `adaptation.${action}`;
    const result = await AICoreRouter(task, payload);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    logger.error("[Domain Adaptation AI] Error:", error);

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/ai/domain
 *
 * Returns available domain adaptation capabilities
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      module: "domain-adaptation",
      capabilities: [
        "align - Align source and target domains",
        "transfer - Transfer learning across domains",
        "adaptFeatures - Adapt feature representations",
        "measureShift - Measure domain shift magnitude",
        "findMapping - Find optimal domain mapping",
        "validateAdaptation - Validate adaptation quality",
      ],
      usage: {
        endpoint: "/api/ai/domain",
        method: "POST",
        body: {
          action: "align | transfer | adaptFeatures | ...",
          payload: {
            source: "Source domain data",
            target: "Target domain data",
          },
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const POST = withAiBilling(
  createAiConfig("domain_analysis", { costPerRequest: 10 }),
  POST_INNER as any
);
