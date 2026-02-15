/**
 * 🔥 PHASE F: Claim Task Management
 *
 * POST /api/claims/[id]/tasks - Create task
 * POST /api/tasks/[id]/complete - Mark task complete
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await prisma.org.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const claimId = params.claimId;
    const body = await req.json();
    const { title, description, priority, category } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        orgId: org.id,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Create task
    const task = await prisma.tasks.create({
      data: {
        orgId: org.id,
        claimId,
        title,
        description: description || null,
        priority: priority || "normal",
        status: "TODO",
      } as any,
    });

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task", details: error.message },
      { status: 500 }
    );
  }
}
