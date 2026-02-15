export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

import { createTrialEndingEmail, createWelcomeEmail, safeSendEmail as sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const { template, to } = await req.json();

    if (!to || !template) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let emailContent;

    switch (template) {
      case "welcome":
        emailContent = createWelcomeEmail({
          userName: "Test User",
        });
        break;

      case "trial-ending":
        emailContent = createTrialEndingEmail({
          userName: "Test User",
          daysRemaining: 1,
        });
        break;

      default:
        return NextResponse.json({ error: "Unknown template" }, { status: 400 });
    }

    const result = await sendMail({
      to,
      ...emailContent,
      dryRun: false, // Actually send the email
    });

    return NextResponse.json({
      success: true,
      id: (result as any)?.id || (result as any)?.data?.id || "unknown",
      description: "Email sent successfully",
    });
  } catch (error) {
    console.error("Dev email send error:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
