export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest } from "next/server";

import { getCurrentUserPermissions, requirePermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";

// Prisma singleton imported from @/lib/db/prisma

export async function GET(request: NextRequest) {
  try {
    await requirePermission("view_tasks");
    const { orgId } = await getCurrentUserPermissions();

    if (!orgId) {
      return Response.json({ error: "Organization not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assigneeId");
    const projectId = searchParams.get("projectId");
    const priority = searchParams.get("priority");
    const dueDate = searchParams.get("dueDate");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = { orgId };
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (projectId) where.projectId = projectId;
    if (priority) where.priority = priority;

    if (dueDate === "overdue") {
      where.dueAt = { lt: new Date() };
      where.status = { in: ["TODO", "IN_PROGRESS"] };
    } else if (dueDate === "today") {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.dueAt = { gte: today, lt: tomorrow };
    } else if (dueDate === "week") {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      where.dueAt = { gte: today, lte: nextWeek };
    }

    const [tasks, totalCount] = await Promise.all([
      prisma.tasks.findMany({
        where,
        include: {
          projects: {
            select: {
              title: true,
              jobNumber: true,
              properties: {
                select: {
                  street: true,
                  city: true,
                },
              },
            },
          },
          users: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ priority: "desc" }, { dueAt: "asc" }, { createdAt: "asc" }],
        take: limit,
        skip: offset,
      }),
      prisma.tasks.count({ where }),
    ]);

    return Response.json({
      tasks,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return Response.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission("create_tasks");
    const { orgId, userId } = await getCurrentUserPermissions();

    if (!orgId || !userId) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      projectId,
      assigneeId,
      dueAt,
      priority = "MEDIUM",
      status = "TODO",
      contactId,
      leadId,
      claimId,
      inspectionId,
      notes,
    } = body;

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await prisma.tasks.create({
      data: {
        id: crypto.randomUUID(),
        orgId,
        title,
        description,
        type,
        projectId,
        assigneeId: assigneeId || userId,
        dueAt: dueAt ? new Date(dueAt) : null,
        priority,
        status,
        contactId,
        leadId,
        claimId,
        inspectionId,
        notes,
        updatedAt: new Date(),
      },
      include: {
        projects: {
          select: {
            title: true,
            jobNumber: true,
          },
        },
        users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Create activity
    await prisma.activities.create({
      data: {
        id: crypto.randomUUID(),
        orgId,
        projectId,
        type: "task_created",
        title: "Task Created",
        description: `Task "${title}" was created`,
        userId,
        userName: "System",
        updatedAt: new Date(),
      },
    });

    return Response.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating tasks:", error);
    return Response.json({ error: "Failed to create tasks" }, { status: 500 });
  }
}
