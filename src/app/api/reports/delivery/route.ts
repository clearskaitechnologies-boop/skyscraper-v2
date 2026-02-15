// TODO: This route has 0 callers and overlaps with reports/email. Wire to UI or remove.
/**
 * /api/reports/delivery
 *
 * Report delivery tracking and confirmation system.
 * Tracks when reports are sent, opened, and downloaded.
 *
 * MIGRATION NEEDED: email_logs model for proper tracking
 * Currently uses email_queue with extra metadata in react_json field.
 *
 * Future model:
 *   model email_log {
 *     id             String    @id @default(cuid())
 *     reportId       String?
 *     claimId        String?
 *     orgId          String
 *     recipientEmail String
 *     recipientName  String?
 *     subject        String
 *     resendId       String?   // External email ID
 *     status         String    @default("queued") // queued, sent, delivered, opened, bounced
 *     openedAt       DateTime?
 *     clickedAt      DateTime?
 *     errorMessage   String?
 *     metadata       Json?
 *     createdAt      DateTime  @default(now())
 *     updatedAt      DateTime  @default(now())
 *   }
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { createTimelineEvent } from "@/lib/claims/timeline";
import prisma from "@/lib/prisma";

/** Unmodeled table — email_queue may not exist in all deployments */
interface EmailQueueRecord {
  id: string;
  org_id: string;
  to_emails: string[];
  subject: string;
  html: string;
  react_json: Record<string, unknown>;
  status: string;
  attempts: number;
  created_at: string;
  updated_at: string;
  last_error: string | null;
}

interface PrismaWithEmailQueue {
  email_queue: {
    create(args: { data: Record<string, unknown> }): Promise<EmailQueueRecord>;
    findMany(args: Record<string, unknown>): Promise<EmailQueueRecord[]>;
  };
}

/**
 * POST /api/reports/delivery
 * Queue a report for delivery via email
 *
 * Body:
 *   reportId: string
 *   claimId?: string
 *   recipientEmail: string
 *   recipientName?: string
 *   reportType: "damage_assessment" | "pre_loss" | "supplement" | "final" | "custom"
 *   pdfUrl?: string (if already generated)
 *   generatePdf?: boolean (if need to generate fresh)
 *   personalMessage?: string
 *   trackOpens?: boolean
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      reportId,
      claimId,
      recipientEmail,
      recipientName,
      reportType = "damage_assessment",
      pdfUrl,
      personalMessage,
      trackOpens = true,
    } = body;

    if (!reportId) {
      return NextResponse.json({ error: "reportId is required" }, { status: 400 });
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: "recipientEmail is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Fetch org, branding, report, and claim details in parallel
    const [org, branding, report, claim] = await Promise.all([
      prisma.org.findUnique({
        where: { id: orgId },
        select: { name: true },
      }),
      prisma.org_branding.findFirst({
        where: { orgId },
        select: { email: true, logoUrl: true, colorPrimary: true },
      }),
      prisma.ai_reports.findUnique({
        where: { id: reportId },
        select: { id: true, title: true, status: true, attachments: true },
      }),
      claimId
        ? prisma.claims.findUnique({
            where: { id: claimId },
            include: {
              properties: { select: { street: true, city: true, state: true } },
            },
          })
        : Promise.resolve(null),
    ]);

    // Generate tracking ID
    const trackingId = `trk_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const trackingPixel = trackOpens
      ? `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/reports/delivery/track?id=${trackingId}" width="1" height="1" style="display:none;" />`
      : "";

    const reportTitle = report?.title || reportType.replace(/_/g, " ");
    const propertyAddress = claim?.properties
      ? `${claim.properties.street}, ${claim.properties.city}, ${claim.properties.state}`
      : "the property";

    // Create email HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: ${branding?.colorPrimary || "#2563eb"}; color: white; padding: 30px; text-align: center; }
    .header img { max-width: 150px; margin-bottom: 15px; }
    .content { padding: 30px; }
    .info-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .label { color: #6b7280; }
    .value { font-weight: 600; color: #111827; }
    .cta { text-align: center; margin: 30px 0; }
    .cta a { display: inline-block; background: ${branding?.colorPrimary || "#2563eb"}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
    .message { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${branding?.logoUrl ? `<img src="${branding.logoUrl}" alt="${org?.name}" />` : ""}
      <h1 style="margin: 0;">📄 Your Report is Ready</h1>
    </div>
    
    <div class="content">
      <p>Hello ${recipientName || "there"},</p>
      
      <p>Your <strong>${reportTitle}</strong> report for ${propertyAddress} has been completed and is ready for your review.</p>
      
      ${personalMessage ? `<div class="message"><p style="margin:0;">${personalMessage}</p></div>` : ""}
      
      <div class="info-box">
        <div class="info-row">
          <span class="label">Report Type</span>
          <span class="value">${reportTitle}</span>
        </div>
        ${claim?.claimNumber ? `<div class="info-row"><span class="label">Claim Number</span><span class="value">${claim.claimNumber}</span></div>` : ""}
        ${claim?.properties?.street ? `<div class="info-row"><span class="label">Property</span><span class="value">${propertyAddress}</span></div>` : ""}
        <div class="info-row">
          <span class="label">Report ID</span>
          <span class="value">${reportId}</span>
        </div>
      </div>
      
      <div class="cta">
        <a href="${pdfUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/reports/download/${reportId}?t=${trackingId}`}">📥 Download Report</a>
      </div>
      
      <p><strong>What's included:</strong></p>
      <ul>
        <li>Detailed damage assessment</li>
        <li>Itemized scope of work</li>
        <li>Cost breakdown and estimates</li>
        <li>Photo documentation</li>
        <li>Professional recommendations</li>
      </ul>
      
      <p>If you have any questions about this report, please don't hesitate to reach out.</p>
    </div>
    
    <div class="footer">
      <p>Prepared by <strong>${org?.name || "Your Restoration Partner"}</strong></p>
      ${branding?.email ? `<p>Contact: ${branding.email}</p>` : ""}
      <p style="font-size: 12px; margin-top: 15px;">Powered by SkaiScraper AI</p>
    </div>
  </div>
  ${trackingPixel}
</body>
</html>
    `;

    // Queue the email (email_queue is optional table, may not exist in all deployments)
    const queuedEmail = await (prisma as unknown as PrismaWithEmailQueue).email_queue.create({
      data: {
        org_id: orgId,
        to_emails: [recipientEmail],
        subject: `${reportTitle} Report Ready - ${claim?.claimNumber || reportId}`,
        html,
        react_json: {
          type: "report_delivery",
          trackingId,
          reportId,
          claimId: claimId || null,
          recipientEmail,
          recipientName: recipientName || null,
          pdfUrl: pdfUrl || null,
          queuedAt: new Date().toISOString(),
          status: "queued",
          opens: 0,
          clicks: 0,
        },
        status: "pending",
        attempts: 0,
      },
    });

    // Create timeline event if claim exists
    if (claimId) {
      await createTimelineEvent({
        claimId,
        type: "report_sent",
        title: "Report Sent",
        body: `${reportTitle} report was emailed to ${recipientName || recipientEmail}.`,
        visibleToClient: true,
        createdById: userId,
      });
    }

    return NextResponse.json({
      ok: true,
      emailId: queuedEmail.id,
      trackingId,
      message: `Report queued for delivery to ${recipientEmail}`,
    });
  } catch (error) {
    console.error("[Report Delivery] Error:", error);
    return NextResponse.json({ error: "Failed to queue report delivery" }, { status: 500 });
  }
}

/**
 * GET /api/reports/delivery
 * Get delivery status for a report
 *
 * Query:
 *   reportId: string
 *   trackingId?: string
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");
    const trackingId = searchParams.get("trackingId");

    if (!reportId && !trackingId) {
      return NextResponse.json({ error: "reportId or trackingId required" }, { status: 400 });
    }

    // Find emails for this report (email_queue is optional table)
    const emails = await (prisma as unknown as PrismaWithEmailQueue).email_queue.findMany({
      where: {
        org_id: orgId,
        react_json: reportId
          ? { path: ["reportId"], equals: reportId }
          : { path: ["trackingId"], equals: trackingId },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    const deliveries = emails.map((email) => {
      const meta = email.react_json;
      return {
        id: email.id,
        trackingId: meta?.trackingId,
        recipientEmail: email.to_emails[0],
        recipientName: meta?.recipientName,
        subject: email.subject,
        status: email.status,
        queuedAt: meta?.queuedAt || email.created_at,
        sentAt: email.status === "sent" ? email.updated_at : null,
        opens: meta?.opens || 0,
        clicks: meta?.clicks || 0,
        lastError: email.last_error,
      };
    });

    return NextResponse.json({
      ok: true,
      deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    console.error("[Report Delivery GET] Error:", error);
    return NextResponse.json({ error: "Failed to get delivery status" }, { status: 500 });
  }
}
