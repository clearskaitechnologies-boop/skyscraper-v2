/**
 * 🔥 PHASE F: Complete Task
 *
 * POST /api/tasks/[id]/complete
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const Org = await prisma.org.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!Org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const taskId = params.taskId;

    // Verify task belongs to Org
    const task = await prisma.tasks.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify task belongs to Org
    if (task.orgId !== Org.id) {
      return NextResponse.json({ error: "Task not found or unauthorized" }, { status: 404 });
    }

    // Mark as completed
    const updatedTask = await prisma.tasks.update({
      where: { id: taskId },
      data: {
        status: "DONE",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error: any) {
    console.error("Error completing task:", error);
    return NextResponse.json(
      { error: "Failed to complete task", details: error.message },
      { status: 500 }
    );
  }
}
