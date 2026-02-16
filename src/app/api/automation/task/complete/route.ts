// app/api/automation/task/complete/route.ts
/**
 * POST /api/automation/task/complete
 * 
 * Completes an automation task
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { completeTask } from "@/lib/intel/automation/executors/tasks";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
    }

    await completeTask(taskId, orgId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("[TASK COMPLETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to complete task", details: String(error) },
      { status: 500 }
    );
  }
}
