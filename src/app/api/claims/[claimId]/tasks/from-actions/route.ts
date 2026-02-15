import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getDelegate } from "@/lib/db/modelAliases";
import prisma from "@/lib/prisma";

const ActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  dueInDays: z.number(),
  assigneeRole: z.string(),
  relatedIds: z.record(z.string()).optional(),
});

const CreateTasksFromActionsSchema = z.object({
  actions: z.array(ActionSchema),
});

/**
 * POST /api/claims/[id]/tasks/from-actions
 * Convert accepted Dominus AI actions into real ClaimTask rows
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: claimId } = await params;
    const body = await req.json();
    const input = CreateTasksFromActionsSchema.parse(body);

    // Verify claim exists and user has access
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        orgId,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get current user
    const user = await prisma.users.findFirst({
      where: {
        clerkUserId: userId,
        orgId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create tasks from actions
    const createdTasks = await Promise.all(
      input.actions.map(async (action) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + action.dueInDays);

        const task = await prisma.tasks.create({
          data: {
            orgId,
            claimId,
            createdById: user.id,
            assigneeRole: action.assigneeRole,
            source: "dominus_ai",
            title: action.title,
            description: action.description || null,
            status: "TODO",
            priority: action.priority as any,
            dueDate,
            relatedIds: action.relatedIds || undefined,
          } as any,
        });

        // Create timeline event for task creation
        await getDelegate("claimTimelineEvent").create({
          data: {
            orgId,
            claimId,
            type: "task_created",
            description: `Dominus AI created task: ${action.title}`,
            actorId: user.id,
            actorType: "ai",
            relatedIds: { taskId: task.id },
            occurredAt: new Date(),
          },
        });

        return task;
      })
    );

    return NextResponse.json({
      success: true,
      tasks: createdTasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueAt,
      })),
    });
  } catch (error: any) {
    console.error("[Tasks from Actions] Error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create tasks", description: error.message },
      { status: 500 }
    );
  }
}
