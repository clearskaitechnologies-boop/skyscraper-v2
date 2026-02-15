/**
 * Multi-Agent AI Endpoint
 *
 * POST /api/ai/agents
 *
 * Specialized endpoint for multi-agent reinforcement learning:
 * - Policy optimization
 * - Workflow coordination
 * - Resource allocation
 * - Action planning
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { AICoreRouter } from "@/lib/ai/router";
import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";

async function POST_INNER(request: NextRequest, ctx: { userId: string; orgId: string }) {
  try {
    const { userId } = ctx;

    const body = await request.json();
    const { action = "optimizePolicy", payload } = body;

    // Validate payload
    if (!payload || !payload.context) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing context in payload.",
          required: {
            context: "Current state and environment information",
          },
        },
        { status: 400 }
      );
    }

    // Route to appropriate agent task
    const task = `multi-agent.${action}`;
    const result = await AICoreRouter(task, payload);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    console.error("[Multi-Agent AI] Error:", error);

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/ai/agents
 *
 * Returns available multi-agent capabilities
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      module: "multi-agent",
      capabilities: [
        "optimizePolicy - Optimize multi-agent policy",
        "coordinateWorkflow - Coordinate workflow between agents",
        "allocateResources - Allocate resources optimally",
        "planActions - Plan next-best actions",
        "evaluateStrategy - Evaluate strategy effectiveness",
        "adaptBehavior - Adapt agent behavior based on environment",
      ],
      usage: {
        endpoint: "/api/ai/agents",
        method: "POST",
        body: {
          action: "optimizePolicy | coordinateWorkflow | ...",
          payload: {
            context: "Current state and environment",
            goals: ["array of objectives"],
          },
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const POST = withAiBilling(
  createAiConfig("ai_agents", { costPerRequest: 20 }),
  POST_INNER as any
);
