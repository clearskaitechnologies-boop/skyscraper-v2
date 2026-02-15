/**
 * Job Timeline API - Project activity timeline
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = params;

    // Get job to verify ownership
    const client = await prisma.client.findFirst({
      where: { userId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const job = await prisma.clientWorkRequest.findFirst({
      where: {
        id: jobId,
        clientId: client.id,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Create timeline from job data
    const events = [
      {
        id: "1",
        type: "created",
        title: "Project Created",
        description: `Work request for ${job.title} was submitted`,
        timestamp: job.createdAt?.toISOString() || new Date().toISOString(),
        user: "You",
      },
    ];

    // Add status updates if they exist
    if (job.status === "in_progress" || job.status === "completed") {
      events.push({
        id: "2",
        type: "started",
        title: "Work Started",
        description: "Contractor began work on this project",
        timestamp: job.updatedAt?.toISOString() || new Date().toISOString(),
        user: "Contractor",
      });
    }

    if (job.status === "completed") {
      events.push({
        id: "3",
        type: "completed",
        title: "Project Completed",
        description: "Work has been completed",
        timestamp: job.updatedAt?.toISOString() || new Date().toISOString(),
        user: "Contractor",
      });
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error("[Job Timeline] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
