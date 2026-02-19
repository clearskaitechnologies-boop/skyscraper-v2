import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    const body = await request.json();
    const { subject, description, priority, clientId } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { success: false, error: "Subject and description are required" },
        { status: 400 }
      );
    }

    // Create a client request record
    const clientRequest = await prisma.tasks.create({
      data: {
        title: subject,
        description,
        priority: priority?.toUpperCase() || "MEDIUM",
        status: "TODO",
        type: "CLIENT_REQUEST",
        orgId: clientId || "unknown", // Will need proper org linking
        notes: `Client request submitted via portal`,
      },
    });

    return NextResponse.json({
      success: true,
      data: clientRequest,
    });
  } catch (error) {
    logger.error("[ClientRequest] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit request" },
      { status: 500 }
    );
  }
}
