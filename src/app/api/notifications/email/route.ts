import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { sendNotificationEmail } from "@/lib/mailer";
import prisma from "@/lib/prisma";

// ITEM 17: Email notification API endpoint — wired to Resend via mailer
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { recipientEmail, recipientName, subject, message, jobType, jobId, orgId, actionUrl } =
      body;

    if (!recipientEmail || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Send real email via Resend
    const emailResult = await sendNotificationEmail({
      to: recipientEmail,
      subject,
      recipientName: recipientName || undefined,
      title: subject,
      body: message,
      actionUrl: actionUrl || (jobId ? `/trades/jobs/${jobId}` : undefined),
      actionLabel: jobType ? `View ${jobType}` : "View Details",
    });

    // Create notification record for audit trail
    if (orgId && jobId) {
      await prisma.projectNotification.create({
        data: {
          id: crypto.randomUUID(),
          orgId,
          claimId: jobId,
          notificationType: "email",
          title: subject,
          message,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Email notification sent",
      emailId: emailResult?.data?.id ?? null,
    });
  } catch (error) {
    console.error("Email notification error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
