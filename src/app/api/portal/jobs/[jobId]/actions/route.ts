/**
 * Portal Jobs Actions - Unified action handler for job operations
 *
 * POST /api/portal/jobs/[jobId]/actions
 * Actions: upload, add_invoice, add_timeline_event, update_status
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update_status"),
    status: z.string(),
  }),
  z.object({
    action: z.literal("add_timeline_event"),
    title: z.string(),
    description: z.string().optional(),
  }),
  z.object({
    action: z.literal("add_note"),
    content: z.string(),
  }),
]);

type ActionInput = z.infer<typeof ActionSchema>;

export async function POST(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // Verify user has access to this job
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

    switch (input.action) {
      case "update_status":
        return handleUpdateStatus(jobId, input);

      case "add_timeline_event":
        return handleAddTimelineEvent(jobId, userId, input);

      case "add_note":
        return handleAddNote(jobId, userId, input);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    logger.error("[Portal Jobs Actions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleUpdateStatus(
  jobId: string,
  input: Extract<ActionInput, { action: "update_status" }>
) {
  const updated = await prisma.clientWorkRequest.update({
    where: { id: jobId },
    data: { status: input.status },
  });

  return NextResponse.json({ success: true, job: updated });
}

async function handleAddTimelineEvent(
  jobId: string,
  userId: string,
  input: Extract<ActionInput, { action: "add_timeline_event" }>
) {
  // Create job timeline event
  const event = await prisma.jobTimelineEvent.create({
    data: {
      jobId,
      title: input.title,
      description: input.description || "",
      createdBy: userId,
    },
  });

  return NextResponse.json({ success: true, event });
}

async function handleAddNote(
  jobId: string,
  userId: string,
  input: Extract<ActionInput, { action: "add_note" }>
) {
  const note = await prisma.jobNote.create({
    data: {
      jobId,
      content: input.content,
      authorId: userId,
    },
  });

  return NextResponse.json({ success: true, note });
}
