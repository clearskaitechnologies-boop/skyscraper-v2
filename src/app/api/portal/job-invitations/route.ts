/**
 * Job Invitation API
 *
 * Handles sending invitations to pros from client job postings
 * Enables bidirectional communication between clients and professionals
 *
 * NOTE: Uses claim_activities as job invitations until JobInvitation model is added
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { getClientFromAuth } from "@/lib/portal/getClientFromAuth";
import prisma from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await getClientFromAuth();
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    const { jobId, proId, message, source = "manual" } = body;

    // Validate required fields
    if (!jobId || !proId) {
      return NextResponse.json({ error: "Job ID and Pro ID are required" }, { status: 400 });
    }

    // Verify job (claim) exists
    const job = await prisma.claims.findFirst({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found or not accessible" }, { status: 404 });
    }

    // Get pro details
    const pro = await prisma.tradesProfile.findUnique({
      where: { id: proId },
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
      },
    });

    // Create invitation as activity
    const invitation = await prisma.activities.create({
      data: {
        id: crypto.randomUUID(),
        orgId: job.orgId,
        type: "JOB_INVITATION_SENT",
        title: `Job invitation sent to ${pro?.companyName || "Pro"}`,
        userId: userId,
        userName: client.firstName
          ? `${client.firstName} ${client.lastName || ""}`.trim()
          : "Client",
        claimId: jobId,
        metadata: {
          jobId,
          proId,
          proName: pro?.companyName || "Unknown Pro",
          clientId: client.id,
          message: message?.trim() || null,
          source,
          status: "pending",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Send notification email to pro if email available
    if (resend && pro?.email) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "noreply@skaiscrape.com",
          to: pro.email,
          subject: `New Job Invitation: ${job.title}`,
          html: `
            <h2>You've Been Invited to a Job!</h2>
            <p><strong>Job:</strong> ${job.title}</p>
            <p><strong>Description:</strong> ${job.description || "No description provided"}</p>
            ${message ? `<p><strong>Message from client:</strong> ${message}</p>` : ""}
            <p>Log in to your portal to respond to this invitation.</p>
          `,
        });
        console.log(`[JOB_INVITATION] Email sent to ${pro.email}`);
      } catch (emailError) {
        console.warn("[JOB_INVITATION] Email failed:", emailError);
      }
    }

    console.log(`[api/portal/job-invitations POST] Created invitation: ${invitation.id}`);

    return NextResponse.json(
      {
        invitation: {
          id: invitation.id,
          jobId,
          proId,
          status: "pending",
          createdAt: invitation.createdAt,
          pro: pro || { companyName: "Unknown", tradeType: "General" },
          job: {
            title: job.title,
            description: job.description,
            tradeType: job.damageType,
            budget: job.estimatedValue,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/portal/job-invitations POST] Error:", error);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await getClientFromAuth();
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");
    const status = url.searchParams.get("status");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Build where clause - query activities that are job invitations
    const where: any = {
      type: "JOB_INVITATION_SENT",
    };

    // Query invitations from activities
    const activities = await prisma.activities.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Parse invitation details from activity metadata
    const invitations = activities
      .map((activity) => {
        const metadata = (activity.metadata as any) || {};

        // Filter by jobId if requested
        if (jobId && metadata.jobId !== jobId) {
          return null;
        }

        // Filter by status if requested
        if (status && metadata.status !== status) {
          return null;
        }

        return {
          id: activity.id,
          jobId: metadata.jobId,
          proId: metadata.proId,
          status: metadata.status || "pending",
          message: metadata.message,
          createdAt: activity.createdAt,
          expiresAt: metadata.expiresAt,
          pro: {
            companyName: metadata.proName || "Unknown",
            tradeType: "General",
          },
        };
      })
      .filter(Boolean);

    const total = invitations.length;

    return NextResponse.json({
      invitations,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("[api/portal/job-invitations GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await getClientFromAuth();
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = await req.json();
    const { invitationId, action, message } = body;

    if (!invitationId || !action) {
      return NextResponse.json({ error: "Invitation ID and action are required" }, { status: 400 });
    }

    if (!["accept", "decline", "cancel"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be accept, decline, or cancel" },
        { status: 400 }
      );
    }

    // Update invitation by finding and updating the activity
    const originalActivity = await prisma.activities.findUnique({
      where: { id: invitationId },
    });

    if (!originalActivity) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const originalMetadata = (originalActivity.metadata as any) || {};

    // Update the activity with response
    await prisma.activities.update({
      where: { id: invitationId },
      data: {
        metadata: {
          ...originalMetadata,
          status:
            action === "accept" ? "accepted" : action === "decline" ? "declined" : "cancelled",
          responseMessage: message?.trim() || null,
          respondedAt: new Date().toISOString(),
        },
      },
    });

    console.log(
      `[api/portal/job-invitations PATCH] Updated invitation: ${invitationId} to ${action}`
    );

    return NextResponse.json({
      invitation: {
        id: invitationId,
        status: action === "accept" ? "accepted" : action === "decline" ? "declined" : "cancelled",
        responseMessage: message?.trim() || null,
        respondedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[api/portal/job-invitations PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 });
  }
}
