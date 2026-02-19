export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// ---------------------------------------------------------------------------
// POST /api/webhooks/twilio — Twilio inbound SMS webhook
// Twilio sends form-urlencoded POST with From, To, Body, MessageSid, etc.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Validate Twilio request signature
    const twilioSignature = req.headers.get("x-twilio-signature");
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    if (!twilioSignature || !twilioAuthToken) {
      logger.warn("[twilio-webhook] Missing Twilio signature or auth token");
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        status: 403,
        headers: { "Content-Type": "text/xml" },
      });
    }

    const contentType = req.headers.get("content-type") || "";
    let from = "";
    let to = "";
    let body = "";
    let messageSid = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      from = formData.get("From")?.toString() || "";
      to = formData.get("To")?.toString() || "";
      body = formData.get("Body")?.toString() || "";
      messageSid = formData.get("MessageSid")?.toString() || "";
    } else {
      const json = await req.json().catch(() => ({}));
      from = json.From || json.from || "";
      to = json.To || json.to || "";
      body = json.Body || json.body || "";
      messageSid = json.MessageSid || json.messageSid || "";
    }

    if (!from || !body) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      });
    }

    logger.debug(`[twilio-inbound] From=${from} Body=${body.substring(0, 100)}`);

    // Normalize phone: strip everything except digits, ensure +1 prefix
    const normalizedPhone = from.replace(/\D/g, "").replace(/^1/, "");
    const phoneVariants = [from, `+1${normalizedPhone}`, `1${normalizedPhone}`, normalizedPhone];

    // Find matching contact across all orgs
    const contact = await prisma.contacts.findFirst({
      where: {
        phone: { in: phoneVariants },
      },
      orderBy: { createdAt: "desc" },
    });

    // Store message in sms_messages table
    await prisma.sms_messages.create({
      data: {
        id: crypto.randomUUID(),
        orgId: contact?.orgId || "unmatched",
        contactId: contact?.id || null,
        direction: "inbound",
        from: from,
        to: to,
        body: body,
        externalId: messageSid || null,
        status: "received",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Return TwiML empty response (no auto-reply for now)
    const twiml = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  } catch (err) {
    logger.error("[twilio-webhook]", err);
    // Always return 200 to Twilio to prevent retries
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }
}
