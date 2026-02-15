/**
 * 3D Vision AI Endpoint
 *
 * POST /api/ai/3d
 *
 * Specialized endpoint for 3D vision tasks:
 * - Object detection in 3D space
 * - Depth estimation
 * - 3D reconstruction
 * - Point cloud processing
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { AICoreRouter } from "@/lib/ai/router";
import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";

async function POST_INNER(request: NextRequest, ctx: { userId: string; orgId: string }) {
  try {
    const { userId } = ctx;

    const body = await request.json();
    const { action = "detectObjects", payload } = body;

    // Validate payload
    if (!payload || (!payload.images && !payload.pointCloud)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing images or point cloud data in payload.",
          required: { images: "array of images" },
        },
        { status: 400 }
      );
    }

    // Route to appropriate 3D task
    const task = `3d.${action}`;
    const result = await AICoreRouter(task, payload);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error: any) {
    console.error("[3D AI] Error:", error);

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/ai/3d
 *
 * Returns available 3D vision capabilities
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      module: "3d",
      capabilities: [
        "detectObjects - Detect objects in 3D space",
        "estimateDepth - Depth estimation from images",
        "reconstruct - 3D reconstruction from multiple views",
        "processPointCloud - Process and analyze point cloud data",
        "measureDamage - Measure damage extent in 3D",
        "generateMesh - Generate 3D mesh from images",
      ],
      usage: {
        endpoint: "/api/ai/3d",
        method: "POST",
        body: {
          action: "detectObjects | estimateDepth | reconstruct | ...",
          payload: { images: ["array of image URLs or buffers"] },
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const POST = withAiBilling(
  createAiConfig("3d_reconstruction", { costPerRequest: 50, planRequired: "pro" }),
  POST_INNER as any
);
