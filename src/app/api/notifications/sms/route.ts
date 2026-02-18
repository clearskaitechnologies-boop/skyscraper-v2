import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { ensureUserOrgContext } from "@/lib/auth/ensureUserOrgContext";
import prisma from "@/lib/prisma";

// ITEM 18: SMS notification API endpoint (Twilio integration)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // SECURITY: Derive orgId server-side and verify membership
    const { orgId } = await ensureUserOrgContext(userId);
    if (!orgId) {
      return NextResponse.json({ error: "No organization context" }, { status: 403 });
    }

    const body = await req.json();
    const { phoneNumber, message, jobType, jobId } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // SECURITY: Verify the phone number belongs to a contact in this org
    const contact = await prisma.contacts.findFirst({
      where: { phone: phoneNumber, orgId },
    });
    if (!contact) {
      return NextResponse.json(
        { error: "Phone number not found in your organization's contacts" },
        { status: 403 }
      );
    }

    // Log the SMS attempt
    logger.debug(`[SMS NOTIFICATION] orgId=${orgId} To: ${phoneNumber} JobId: ${jobId || "N/A"}`);

    // Twilio integration (if credentials are configured)
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      try {
        const twilio = require("twilio");
        const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        const result = await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        });

        logger.debug(`[SMS SENT] SID: ${result.sid}`);

        return NextResponse.json({
          success: true,
          message: "SMS sent successfully",
          sid: result.sid,
        });
      } catch (twilioError: any) {
        console.error("Twilio error:", twilioError);
        return NextResponse.json(
          { error: `Twilio error: ${twilioError.message}` },
          { status: 500 }
        );
      }
    }

    // Fallback: Queue for later or log only
    return NextResponse.json({
      success: true,
      message: "SMS logged (Twilio not configured)",
      mode: "mock",
    });
  } catch (error) {
    logger.error("SMS notification error:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
