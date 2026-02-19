// ORG-SCOPE: Scoped by userId — own responses filtered by contractorId (member.id) or job ownership verified via clientId. No cross-tenant risk.
/**
 * Client Job Request Responses API
 * Allows contractors to respond to client job requests
 */

import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET - Get responses for a job request (client) or contractor's responses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobRequestId = searchParams.get("jobRequestId");
    const myResponses = searchParams.get("mine") === "true";

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (myResponses) {
      // Get contractor's own responses
      const member = await prisma.tradesCompanyMember.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!member) {
        return NextResponse.json({ error: "Contractor profile not found" }, { status: 404 });
      }

      const responses = await prisma.clientJobResponse.findMany({
        where: { contractorId: member.id },
        include: {
          ClientWorkRequest: {
            include: {
              Client: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ responses });
    }

    if (jobRequestId) {
      // Get all responses for a specific job request (client viewing)
      const client = await prisma.client.findUnique({
        where: { userId },
        select: { id: true },
      });

      // Verify the client owns this job request
      const jobRequest = await prisma.clientWorkRequest.findFirst({
        where: {
          id: jobRequestId,
          clientId: client?.id,
        },
      });

      if (!jobRequest) {
        return NextResponse.json({ error: "Job request not found" }, { status: 404 });
      }

      const responses = await prisma.clientJobResponse.findMany({
        where: { jobRequestId },
        include: {
          tradesCompanyMember: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              avatar: true,
              jobTitle: true,
              yearsExperience: true,
              specialties: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ responses });
    }

    return NextResponse.json({ error: "jobRequestId or mine=true required" }, { status: 400 });
  } catch (error) {
    logger.error("Error fetching responses:", error);
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 });
  }
}

// POST - Contractor submits a response to a job request
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get contractor profile
    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: {
        id: true,
        companyName: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "You must have a trades profile to respond to job requests" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      jobRequestId,
      message,
      estimatedPrice,
      estimatedPriceMin,
      estimatedPriceMax,
      estimatedTimeline,
      availableDate,
      attachments = [],
    } = body;

    if (!jobRequestId || !message) {
      return NextResponse.json({ error: "jobRequestId and message are required" }, { status: 400 });
    }

    // Verify job request exists and is active
    const jobRequest = await prisma.clientWorkRequest.findFirst({
      where: {
        id: jobRequestId,
        status: "pending",
      },
    });

    if (!jobRequest) {
      return NextResponse.json(
        { error: "Job request not found or no longer accepting responses" },
        { status: 404 }
      );
    }

    // Check if contractor already responded
    const existingResponse = await prisma.clientJobResponse.findUnique({
      where: {
        jobRequestId_contractorId: {
          jobRequestId,
          contractorId: member.id,
        },
      },
    });

    if (existingResponse) {
      return NextResponse.json(
        { error: "You have already responded to this job request" },
        { status: 409 }
      );
    }

    // Create the response
    const companyName = member.companyName || `${member.firstName} ${member.lastName}`;

    const response = await prisma.clientJobResponse.create({
      data: {
        id: crypto.randomUUID(),
        jobRequestId,
        contractorId: member.id,
        companyName,
        message,
        estimatedPrice,
        estimatedPriceMin: estimatedPriceMin ? parseFloat(estimatedPriceMin) : null,
        estimatedPriceMax: estimatedPriceMax ? parseFloat(estimatedPriceMax) : null,
        estimatedTimeline,
        availableDate: availableDate ? new Date(availableDate) : null,
        attachments,
      },
      include: {
        tradesCompanyMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            avatar: true,
          },
        },
      },
    });

    // Increment response count on job request
    await prisma.clientWorkRequest.update({
      where: { id: jobRequestId },
      data: { responseCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    logger.error("Error creating response:", error);
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 });
  }
}

// PATCH - Update response status (client shortlisting, accepting, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { responseId, status } = body;

    if (!responseId || !status) {
      return NextResponse.json({ error: "responseId and status required" }, { status: 400 });
    }

    const validStatuses = ["pending", "viewed", "shortlisted", "accepted", "declined"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get client
    const client = await prisma.client.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Verify the response belongs to client's job request
    const response = await prisma.clientJobResponse.findUnique({
      where: { id: responseId },
      include: {
        ClientWorkRequest: {
          select: { clientId: true },
        },
      },
    });

    if (!response || response.ClientWorkRequest.clientId !== client.id) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    // Update the response
    const updated = await prisma.clientJobResponse.update({
      where: { id: responseId },
      data: {
        status,
        viewedAt: status === "viewed" && !response.viewedAt ? new Date() : response.viewedAt,
      },
    });

    return NextResponse.json({
      success: true,
      response: updated,
    });
  } catch (error) {
    logger.error("Error updating response:", error);
    return NextResponse.json({ error: "Failed to update response" }, { status: 500 });
  }
}
