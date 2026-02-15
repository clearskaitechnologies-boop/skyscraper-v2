/**
 * GET /api/calendar/events
 * Returns calendar events for org
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get("date");
  const view = searchParams.get("view") || "month";

  const targetDate = dateParam ? new Date(dateParam) : new Date();

  try {
    // Calculate date range based on view
    let startDate: Date;
    let endDate: Date;

    if (view === "day") {
      startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (view === "week") {
      startDate = new Date(targetDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
    } else {
      // month
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    // Fetch tasks as calendar events
    const tasks = await prisma.tasks.findMany({
      where: {
        orgId,
        dueAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        dueAt: "asc",
      },
    });

    // Fetch scheduled jobs as project events
    let jobSchedules: any[] = [];
    try {
      jobSchedules = await prisma.job_schedules.findMany({
        where: {
          orgId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: "asc",
        },
      });
    } catch (e) {
      // Job schedule table may not exist yet
      console.log("[Calendar] job_schedules table not available:", (e as Error).message ?? e);
    }

    // Transform tasks to calendar events
    const taskEvents = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      date: task.dueAt,
      type: task.title.toLowerCase().includes("inspection")
        ? "inspection"
        : task.title.toLowerCase().includes("build")
          ? "build"
          : task.title.toLowerCase().includes("appointment")
            ? "appointment"
            : "reminder",
      leadId: task.leadId,
      status: task.status,
      assignedTo: task.assigneeId,
    }));

    // Transform job schedules to calendar events with yellow "project" type
    const projectEvents = jobSchedules.map((job) => ({
      id: job.id,
      title: job.notes || "Scheduled Job",
      date: job.date,
      type: "project" as const,
      crew: job.crew,
      claimId: job.claimId,
    }));

    const events = [...taskEvents, ...projectEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      events,
      count: events.length,
      range: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (err: any) {
    console.error("[Calendar API Error]:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
