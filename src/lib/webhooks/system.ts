/**
 * Webhook System
 *
 * Outbound webhooks for integrations
 * Send real-time events to external systems
 */

import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export type WebhookEvent =
  | "claim.created"
  | "claim.updated"
  | "claim.status_changed"
  | "job.created"
  | "job.updated"
  | "job.completed"
  | "document.uploaded"
  | "payment.received"
  | "invoice.sent";

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  createdAt: Date;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: Date;
  data: Record<string, any>;
  orgId: string;
}

/**
 * Register webhook endpoint
 */
export async function registerWebhook(
  orgId: string,
  url: string,
  events: WebhookEvent[],
  secret?: string
): Promise<WebhookEndpoint> {
  try {
    const endpoint = (await prisma.webhookEndpoints.create({
      data: {
        orgId,
        url,
        events,
        secret: secret || generateWebhookSecret(),
        active: true,
      },
    })) as any;

    return endpoint;
  } catch (error) {
    logger.error("Failed to register webhook:", error);
    throw new Error("Failed to register webhook");
  }
}

/**
 * Trigger webhook
 */
export async function triggerWebhook(
  orgId: string,
  event: WebhookEvent,
  data: Record<string, any>
): Promise<void> {
  try {
    // Get active endpoints for this event
    const endpoints = await prisma.webhookEndpoints.findMany({
      where: {
        orgId,
        active: true,
        events: {
          has: event,
        },
      },
    });

    if (endpoints.length === 0) {
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date(),
      data,
      orgId,
    };

    // Send to all endpoints in parallel
    await Promise.allSettled(endpoints.map((endpoint) => sendWebhook(endpoint, payload)));
  } catch (error) {
    logger.error("Webhook trigger failed:", error);
  }
}

/**
 * Send webhook to endpoint
 */
async function sendWebhook(endpoint: any, payload: WebhookPayload): Promise<void> {
  try {
    // Generate signature
    const signature = generateSignature(payload, endpoint.secret);

    // Send HTTP POST
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": payload.event,
        "User-Agent": "Skai-Webhooks/1.0",
      },
      body: JSON.stringify(payload),
    });

    // Log delivery
    await logWebhookDelivery({
      endpointId: endpoint.id,
      event: payload.event,
      success: response.ok,
      statusCode: response.status,
      payload,
    });

    if (!response.ok) {
      logger.error(`Webhook delivery failed: ${response.status}`);

      // Retry logic
      if (shouldRetry(response.status)) {
        await retryWebhook(endpoint, payload, 1);
      }
    }
  } catch (error) {
    logger.error("Webhook send failed:", error);

    // Log failure
    await logWebhookDelivery({
      endpointId: endpoint.id,
      event: payload.event,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      payload,
    });

    // Retry
    await retryWebhook(endpoint, payload, 1);
  }
}

/**
 * Retry webhook delivery
 */
async function retryWebhook(
  endpoint: any,
  payload: WebhookPayload,
  attempt: number,
  maxAttempts: number = 3
): Promise<void> {
  if (attempt >= maxAttempts) {
    logger.error(`Webhook max retries reached for ${endpoint.url}`);
    return;
  }

  // Exponential backoff: 1s, 2s, 4s
  const delay = Math.pow(2, attempt) * 1000;

  await new Promise((resolve) => setTimeout(resolve, delay));

  try {
    const signature = generateSignature(payload, endpoint.secret);

    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": payload.event,
        "X-Webhook-Retry": attempt.toString(),
        "User-Agent": "Skai-Webhooks/1.0",
      },
      body: JSON.stringify(payload),
    });

    await logWebhookDelivery({
      endpointId: endpoint.id,
      event: payload.event,
      success: response.ok,
      statusCode: response.status,
      attempt,
      payload,
    });

    if (!response.ok && shouldRetry(response.status)) {
      await retryWebhook(endpoint, payload, attempt + 1, maxAttempts);
    }
  } catch (error) {
    await logWebhookDelivery({
      endpointId: endpoint.id,
      event: payload.event,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      attempt,
      payload,
    });

    await retryWebhook(endpoint, payload, attempt + 1, maxAttempts);
  }
}

/**
 * Generate webhook signature (HMAC)
 */
function generateSignature(payload: WebhookPayload, secret: string): string {
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest("hex");
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  return signature === expectedSignature;
}

/**
 * Generate webhook secret
 */
function generateWebhookSecret(): string {
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Should retry based on status code
 */
function shouldRetry(statusCode: number): boolean {
  // Retry on server errors and rate limits
  return statusCode >= 500 || statusCode === 429;
}

/**
 * Log webhook delivery
 */
async function logWebhookDelivery(data: {
  endpointId: string;
  event: WebhookEvent;
  success: boolean;
  statusCode?: number;
  error?: string;
  attempt?: number;
  payload: WebhookPayload;
}): Promise<void> {
  try {
    await prisma.webhookDeliveries
      ?.create({
        data: {
          endpointId: data.endpointId,
          event: data.event,
          success: data.success,
          statusCode: data.statusCode,
          error: data.error,
          attempt: data.attempt || 1,
          payload: data.payload,
          deliveredAt: new Date(),
        },
      })
      .catch(() => {});
  } catch (error) {
    logger.error("Failed to log webhook delivery:", error);
  }
}

/**
 * Get webhook endpoints
 */
export async function getWebhookEndpoints(orgId: string): Promise<WebhookEndpoint[]> {
  try {
    return (await prisma.webhookEndpoints.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    })) as WebhookEndpoint[];
  } catch {
    return [];
  }
}

/**
 * Update webhook endpoint
 */
export async function updateWebhook(
  endpointId: string,
  updates: {
    url?: string;
    events?: WebhookEvent[];
    active?: boolean;
  }
): Promise<boolean> {
  try {
    await prisma.webhookEndpoints.update({
      where: { id: endpointId },
      data: updates,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete webhook endpoint
 */
export async function deleteWebhook(endpointId: string): Promise<boolean> {
  try {
    await prisma.webhookEndpoints.delete({
      where: { id: endpointId },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Test webhook endpoint
 */
export async function testWebhook(
  endpointId: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const endpoint = await prisma.webhookEndpoints.findUnique({
      where: { id: endpointId },
    });

    if (!endpoint) {
      return { success: false, error: "Endpoint not found" };
    }

    const testPayload: WebhookPayload = {
      event: "claim.created",
      timestamp: new Date(),
      data: {
        test: true,
        message: "This is a test webhook",
      },
      orgId: endpoint.orgId,
    };

    const signature = generateSignature(testPayload, endpoint.secret);

    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": testPayload.event,
        "X-Webhook-Test": "true",
        "User-Agent": "SkaiScraper-Webhooks/1.0",
      },
      body: JSON.stringify(testPayload),
    });

    return {
      success: response.ok,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get webhook delivery history
 */
export async function getWebhookDeliveries(endpointId: string, limit: number = 50) {
  try {
    return (
      (await prisma.webhookDeliveries?.findMany({
        where: { endpointId },
        orderBy: { deliveredAt: "desc" },
        take: limit,
      })) || []
    );
  } catch {
    return [];
  }
}

/**
 * Quick webhook triggers for common events
 */
export async function webhookClaimCreated(orgId: string, claim: any) {
  await triggerWebhook(orgId, "claim.created", {
    claimId: claim.id,
    claimNumber: claim.claimNumber,
    status: claim.status,
    lossType: claim.lossType,
  });
}

export async function webhookJobCompleted(orgId: string, job: any) {
  await triggerWebhook(orgId, "job.completed", {
    jobId: job.id,
    title: job.title,
    actualCost: job.actualCost,
    completedAt: job.completedAt,
  });
}

export async function webhookPaymentReceived(orgId: string, payment: any) {
  await triggerWebhook(orgId, "payment.received", {
    paymentId: payment.id,
    amount: payment.amount,
    method: payment.method,
  });
}
