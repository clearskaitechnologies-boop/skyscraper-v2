/**
 * Job Invite API - Client Portal
 * Sends an invitation to a contractor to join a job/project
 *
 * Uses ClientWorkRequest with targetProId to track the invited contractor
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { proId, jobId, message } = body;

    if (!proId || !jobId) {
      return NextResponse.json({ error: "Pro ID and Job ID are required" }, { status: 400 });
    }

    // Get the client profile
    const email = user.emailAddresses?.[0]?.emailAddress;
    const client = await prisma.client.findFirst({
      where: {
        OR: [{ userId }, { email }],
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client profile not found. Please complete your profile." },
        { status: 404 }
      );
    }

    // Verify the work request belongs to this client
    const workRequest = await prisma.clientWorkRequest.findFirst({
      where: {
        id: jobId,
        clientId: client.id,
      },
    });

    if (!workRequest) {
      return NextResponse.json(
        { error: "Job not found or you don't have access" },
        { status: 404 }
      );
    }

    // Check if this pro is already invited (targetProId matches)
    if (workRequest.targetProId === proId) {
      return NextResponse.json({
        success: true,
        message: "Invitation already sent to this contractor",
      });
    }

    // Update the work request with the target pro
    const updatedRequest = await prisma.clientWorkRequest.update({
      where: { id: jobId },
      data: {
        targetProId: proId,
        status: "invited",
        updatedAt: new Date(),
      },
    });

    // Note: ProjectNotification requires orgId and claimId which don't exist in work request context
    // The work request status itself serves as the notification mechanism

    return NextResponse.json({
      success: true,
      workRequest: updatedRequest,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Job invite error:", error);
    return NextResponse.json({ error: "Failed to send job invitation" }, { status: 500 });
  }
}

// Get work requests with invited pros (invitations sent by client)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    const client = await prisma.client.findFirst({
      where: {
        OR: [{ userId }, { email }],
      },
    });

    if (!client) {
      return NextResponse.json({ invitations: [] });
    }

    // Get work requests that have a targetProId set (i.e., an invitation was sent)
    // tradesCompany uses 'name' not 'businessName'
    const workRequestsWithInvites = await prisma.clientWorkRequest.findMany({
      where: {
        clientId: client.id,
        targetProId: { not: null },
      },
      include: {
        tradesCompany: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Format as invitations for the frontend
    const invitations = workRequestsWithInvites.map((wr) => ({
      id: wr.id,
      workRequestId: wr.id,
      workRequestTitle: wr.title,
      workRequestStatus: wr.status,
      contractorId: wr.targetProId,
      contractorName: wr.tradesCompany?.name || "Unknown",
      status: wr.status === "invited" ? "PENDING" : wr.status.toUpperCase(),
      sentAt: wr.updatedAt,
    }));

    return NextResponse.json({
      invitations,
    });
  } catch (error) {
    console.error("Get invitations error:", error);
    return NextResponse.json({ error: "Failed to get invitations" }, { status: 500 });
  }
}
