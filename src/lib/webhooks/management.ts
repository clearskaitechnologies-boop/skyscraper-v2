/**
 * TASK 143: WEBHOOK MANAGEMENT
 *
 * Webhook configuration and delivery tracking.
 */

import prisma from "@/lib/prisma";

export type WebhookEvent =
  | "claim.created"
  | "claim.updated"
  | "task.completed"
  | "report.generated";

export interface Webhook {
  id: string;
  tenantId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  enabled: boolean;
  createdAt: Date;
}

export async function createWebhook(
  tenantId: string,
  data: {
    url: string;
    events: WebhookEvent[];
    secret?: string;
  }
): Promise<string> {
  const webhook = await prisma.webhook.create({
    data: {
      tenantId,
      url: data.url,
      events: data.events as any,
      secret: data.secret || generateSecret(),
      enabled: true,
    } as any,
  });

  return webhook.id;
}

function generateSecret(): string {
  return `whsec_${Math.random().toString(36).substring(2, 15)}`;
}

export async function deliverWebhook(
  tenantId: string,
  event: WebhookEvent,
  payload: any
): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: {
      tenantId,
      enabled: true,
      events: { has: event },
    },
  });

  for (const webhook of webhooks) {
    try {
      const signature = generateSignature(webhook.secret, payload);

      await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
        },
        body: JSON.stringify(payload),
      });

      await recordDelivery(webhook.id, "success");
    } catch (error: any) {
      await recordDelivery(webhook.id, "failed", error.message);
    }
  }
}

function generateSignature(secret: string, payload: any): string {
  // TODO: Use crypto.createHmac for real signature
  return `sha256=${secret}`;
}

async function recordDelivery(webhookId: string, status: string, error?: string): Promise<void> {
  await prisma.webhookDelivery.create({
    data: {
      webhookId,
      status,
      error,
      timestamp: new Date(),
    } as any,
  });
}

export async function getWebhooks(tenantId: string): Promise<Webhook[]> {
  const webhooks = await prisma.webhook.findMany({
    where: { tenantId },
  });
  return webhooks as any;
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  await prisma.webhook.delete({ where: { id: webhookId } });
}
