/**
 * Pilot Feedback API
 *
 * Collects feedback from pilot users for product improvement.
 */

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface FeedbackPayload {
  type: "bug" | "feature" | "general" | "praise";
  category?: string;
  rating?: number;
  message: string;
  page?: string;
  screenshot?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as FeedbackPayload;

    if (!body.message || body.message.trim().length < 10) {
      return NextResponse.json(
        { error: "Feedback message must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (!body.type || !["bug", "feature", "general", "praise"].includes(body.type)) {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 });
    }

    if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Store feedback
    const feedback = await prisma.pilot_feedback.create({
      data: {
        id: crypto.randomUUID(),
        user_id: session.userId,
        org_id: session.orgId || null,
        type: body.type,
        category: body.category || null,
        rating: body.rating || null,
        message: body.message.trim(),
        page: body.page || null,
        screenshot: body.screenshot || null,
        created_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      message: "Thank you for your feedback!",
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's own feedback history
    const feedback = await prisma.pilot_feedback.findMany({
      where: {
        user_id: session.userId,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 20,
      select: {
        id: true,
        type: true,
        category: true,
        rating: true,
        message: true,
        page: true,
        created_at: true,
        status: true,
        response: true,
      },
    });

    return NextResponse.json({
      feedback,
      count: feedback.length,
    });
  } catch (error) {
    console.error("Feedback GET error:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}
