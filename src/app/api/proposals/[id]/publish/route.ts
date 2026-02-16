export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * PHASE 3 SPRINT 3: POST /api/proposals/[id]/publish
 * Publishes a proposal (marks as published, optionally sends email)
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { FROM_EMAIL, getResend, REPLY_TO_EMAIL, TEMPLATES } from "@/lib/email/resend";
import prisma from "@/lib/prisma";
import type { ProposalPublishResponse } from "@/lib/proposals/types";
import { ProposalPublishSchema } from "@/lib/validation/schemas";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Authenticate user
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const bodyData = await request.json();

    // Validate request body with Zod
    const body = ProposalPublishSchema.parse(bodyData);

    // Fetch proposal draft
    const draft = await prisma.proposal_drafts.findUnique({
      where: { id },
    });

    if (!draft) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Verify org ownership
    if (draft.org_id !== orgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify proposal has been rendered
    const hasFiles = await prisma.proposal_files.findFirst({
      where: { proposal_id: id, kind: "pdf" },
    });

    if (!hasFiles) {
      return NextResponse.json(
        { error: "Proposal must be rendered before publishing" },
        { status: 400 }
      );
    }

    // Update status to published
    await prisma.proposal_drafts.update({
      where: { id },
      data: { status: "published" },
    });

    // Send email if recipients provided
    let emailsSentCount = 0;
    if (body.emailRecipients && body.emailRecipients.length > 0) {
      try {
        const resend = getResend();
        const proposalLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com"}/proposals/${id}`;

        // Get org branding for email customization
        const orgBranding = await prisma.org_branding.findFirst({
          where: { orgId },
          select: { companyName: true },
        });

        // Send emails to all recipients
        const emailPromises = body.emailRecipients.map(async (recipientEmail) => {
          try {
            await resend.emails.send({
              from: FROM_EMAIL,
              replyTo: REPLY_TO_EMAIL,
              to: recipientEmail,
              subject: TEMPLATES.PROPOSAL_PUBLISHED.subject,
              html: TEMPLATES.PROPOSAL_PUBLISHED.getHtml({
                recipientName: recipientEmail.split("@")[0],
                proposalLink: proposalLink,
                message: body.message,
                companyName: orgBranding?.companyName || "SkaiScraper",
              }),
            });
            emailsSentCount++;
          } catch (err) {
            logger.error(`Failed to send proposal email to ${recipientEmail}:`, err);
          }
        });

        await Promise.allSettled(emailPromises);
      } catch (emailError) {
        console.error("Error sending proposal emails:", emailError);
        // Don't fail the whole request if email fails
      }
    }

    // Track analytics: proposal.published
    console.log("[Analytics] proposal.published", {
      userId,
      orgId,
      proposalId: id,
      packetType: draft.packet_type,
      emailSent: emailsSentCount > 0,
    });

    const response: ProposalPublishResponse = {
      success: true,
      publishedAt: new Date(),
      emailsSent: emailsSentCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("[API] /api/proposals/[id]/publish error:", error);
    return NextResponse.json(
      {
        error: "Failed to publish proposal",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
