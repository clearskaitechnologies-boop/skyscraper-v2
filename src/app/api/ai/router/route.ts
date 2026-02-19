/**
 * Universal AI Router Endpoint
 *
 * POST /api/ai/router
 *
 * Universal entry point for executing any AI task through the core router.
 * Discovers and routes to any of the 275 AI modules automatically.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { AICoreRouter, getRegistryStats, listAIModules, listAITasks } from "@/lib/ai/router";
import { AiBillingContext, createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";

async function POST_INNER(request: NextRequest, ctx: AiBillingContext) {
  try {
    const { userId } = ctx;

    // Parse request body
    const body = await request.json();
    const { task, payload } = body;

    // Validate task parameter
    if (!task || typeof task !== "string") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing or invalid 'task' parameter. Expected string in format 'module.function'.",
          example: { task: "video.analyze", payload: { file: "..." } },
          availableTasks: listAITasks().slice(0, 20), // Show first 20 as examples
        },
        { status: 400 }
      );
    }

    // Execute AI task
    const result = await AICoreRouter(task, payload);

    // Return result with appropriate status code
    const statusCode = result.success ? 200 : 400;

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    logger.error("[AI Router] Unexpected error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during AI task execution.",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/router
 *
 * Returns comprehensive information about the AI system:
 * - All available tasks
 * - Module statistics
 * - Usage documentation
 */
async function GET_INNER(request: NextRequest, ctx: AiBillingContext) {
  try {
    const { userId } = ctx;

    const tasks = listAITasks();
    const modules = listAIModules();
    const stats = getRegistryStats();

    return NextResponse.json({
      success: true,
      system: "AI Core Router",
      status: "OPERATIONAL",
      statistics: stats,
      modules: modules.map((m) => ({
        name: m.name,
        taskCount: m.tasks.length,
        tasks: m.tasks,
      })),
      totalTasks: tasks.length,
      allTasks: tasks,
      usage: {
        method: "POST",
        endpoint: "/api/ai/router",
        body: {
          task: "module.function",
          payload: "{ ...task-specific data }",
        },
        examples: [
          {
            task: "video.analyze",
            payload: { url: "https://example.com/video.mp4" },
            description: "Analyze video for motion, scenes, and objects",
          },
          {
            task: "3d.detectObjects",
            payload: { images: ["img1.jpg", "img2.jpg"] },
            description: "Detect objects in 3D space from multiple images",
          },
          {
            task: "multi-agent.optimizePolicy",
            payload: { context: { state: "...", goals: ["..."] } },
            description: "Optimize multi-agent policy for workflow coordination",
          },
          {
            task: "adaptation.align",
            payload: { source: "...", target: "..." },
            description: "Align source and target domains for transfer learning",
          },
        ],
      },
      endpoints: {
        universal: "/api/ai/router",
        video: "/api/ai/video",
        "3d": "/api/ai/3d",
        agents: "/api/ai/agents",
        domain: "/api/ai/domain",
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const POST = withAiBilling(createAiConfig("ai_router", { costPerRequest: 5 }), POST_INNER);

export const GET = withAiBilling(createAiConfig("ai_router", { costPerRequest: 0 }), GET_INNER);
