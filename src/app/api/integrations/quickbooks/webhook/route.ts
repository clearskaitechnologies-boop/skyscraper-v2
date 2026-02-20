/**
 * POST /api/integrations/quickbooks/webhook
 *
 * Inbound webhook from QuickBooks Online.
 * Handles change notifications for Customers, Invoices, Payments, etc.
 *
 * QB sends webhooks as EventNotification payloads signed with HMAC-SHA256.
 * Docs: https://developer.intuit.com/app/developer/qbo/docs/develop/webhooks
 */

import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_VERIFIER_TOKEN = process.env.QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN || "";

/**
 * Verify QuickBooks webhook signature (HMAC-SHA256)
 */
async function verifyQBSignature(
  payload: string,
  signatureHeader: string | null
): Promise<boolean> {
  if (!WEBHOOK_VERIFIER_TOKEN) {
    logger.warn("[QB_WEBHOOK] No verifier token configured — skipping verification");
    return process.env.NODE_ENV !== "production";
  }

  if (!signatureHeader) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(WEBHOOK_VERIFIER_TOKEN),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const computedBase64 = Buffer.from(signature).toString("base64");
    return computedBase64 === signatureHeader;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("intuit-signature");

    // Verify signature
    const isValid = await verifyQBSignature(rawBody, signature);
    if (!isValid) {
      logger.warn("[QB_WEBHOOK] Invalid signature — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // QB webhook structure: { eventNotifications: [{ realmId, dataChangeEvent: { entities: [...] } }] }
    const notifications = body.eventNotifications || [];

    for (const notification of notifications) {
      const realmId = notification.realmId;
      const entities = notification.dataChangeEvent?.entities || [];

      // Find which org this realmId belongs to
      const conn = await prisma.quickbooks_connections.findFirst({
        where: { realm_id: realmId, is_active: true },
      });

      if (!conn) {
        logger.warn(`[QB_WEBHOOK] No active connection for realmId ${realmId}`);
        continue;
      }

      for (const entity of entities) {
        const { name, id, operation } = entity;

        logger.info(`[QB_WEBHOOK] ${operation} on ${name} #${id} for org ${conn.org_id}`);

        // Record the webhook event for audit trail
        await prisma.quickbooks_connections.update({
          where: { id: conn.id },
          data: {
            sync_errors: [
              ...(Array.isArray(conn.sync_errors) ? (conn.sync_errors as any[]).slice(-49) : []),
              {
                type: "webhook",
                entity: name,
                entityId: id,
                operation,
                receivedAt: new Date().toISOString(),
              },
            ],
          },
        });

        // Entity-specific handling can be added here:
        // switch (name) {
        //   case "Customer":
        //   case "Invoice":
        //   case "Payment":
        //   case "Purchase":
        //     // Sync back to SkaiScrape
        //     break;
        // }
      }
    }

    // QB requires 200 response within 10 seconds
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("[QB_WEBHOOK_ERROR]", error);
    // Still return 200 to prevent QB from retrying
    return NextResponse.json({ ok: true });
  }
}
