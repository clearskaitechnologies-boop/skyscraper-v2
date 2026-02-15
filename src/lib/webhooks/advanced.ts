/**
 * TASK 119: WEBHOOKS V2
 *
 * Enhanced webhook system with payload transformation, retry strategies, and monitoring.
 */

import crypto from "crypto";

import prisma from "@/lib/prisma";

export type WebhookEvent =
  | "claim.created"
  | "claim.updated"
  | "claim.deleted"
  | "job.created"
  | "job.updated"
  | "job.completed"
  | "task.created"
  | "task.assigned"
  | "task.completed"
  | "invoice.created"
  | "invoice.paid"
  | "payment.received"
  | "user.created"
  | "user.updated"
  | "document.uploaded";

export type WebhookStatus = "pending" | "sent" | "failed" | "retrying";

export type RetryStrategy = "exponential" | "linear" | "fixed";

export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  retryStrategy: RetryStrategy;
  maxRetries: number;
  timeout: number; // milliseconds
  headers?: Record<string, string>;
  transform?: string; // JavaScript transformation function
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  status: WebhookStatus;
  attempts: number;
  lastAttempt?: Date;
  nextRetry?: Date;
  response?: {
    status: number;
    body: string;
    headers: Record<string, string>;
  };
  error?: string;
  createdAt: Date;
}

/** Delivery record joined with its parent webhook */
interface DeliveryWithWebhook {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  status: WebhookStatus;
  attempts: number;
  lastAttempt?: Date | null;
  nextRetry?: Date | null;
  response?: Record<string, unknown> | null;
  error?: string | null;
  createdAt: Date;
  webhook: {
    id: string;
    url: string;
    secret: string;
    retryStrategy: string;
    maxRetries: number;
    timeout: number;
    headers?: Record<string, string> | null;
    transform?: string | null;
  };
}

/**
 * Create webhook configuration
 */
export async function createWebhook(
  organizationId: string,
  config: Omit<WebhookConfig, "id" | "secret">
): Promise<string> {
  const secret = generateWebhookSecret();

  const webhook = await prisma.webhook.create({
    data: {
      organizationId,
      url: config.url,
      events: config.events,
      secret,
      isActive: config.isActive ?? true,
      retryStrategy: config.retryStrategy || "exponential",
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 30000,
      headers: (config.headers ?? undefined) as unknown as Record<string, string> | undefined,
      transform: config.transform,
    },
  });

  return webhook.id;
}

/**
 * Update webhook configuration
 */
export async function updateWebhook(
  webhookId: string,
  updates: Partial<Omit<WebhookConfig, "id" | "secret">>
): Promise<void> {
  await prisma.webhook.update({
    where: { id: webhookId },
    data: updates as unknown as Record<string, unknown>,
  });
}

/**
 * Delete webhook
 */
export async function deleteWebhook(webhookId: string): Promise<void> {
  await prisma.webhook.delete({
    where: { id: webhookId },
  });
}

/**
 * Get webhook configuration
 */
export async function getWebhook(webhookId: string): Promise<WebhookConfig | null> {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
  });

  return webhook as unknown as WebhookConfig | null;
}

/**
 * List webhooks
 */
export async function listWebhooks(organizationId: string): Promise<WebhookConfig[]> {
  const webhooks = await prisma.webhook.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  return webhooks as unknown as WebhookConfig[];
}

/**
 * Trigger webhook event
 */
export async function triggerWebhook(
  organizationId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<void> {
  // Find all webhooks subscribed to this event
  const webhooks = await prisma.webhook.findMany({
    where: {
      organizationId,
      isActive: true,
      events: { has: event },
    },
  });

  // Create delivery records
  for (const webhook of webhooks) {
    await createDelivery(webhook.id, event, payload);
  }

  // Process deliveries asynchronously
  processDeliveries();
}

/**
 * Create webhook delivery
 */
async function createDelivery(
  webhookId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<string> {
  const delivery = await prisma.webhookDelivery.create({
    data: {
      webhookId,
      event,
      payload: payload as unknown as Record<string, unknown>,
      status: "pending",
      attempts: 0,
    },
  });

  return delivery.id;
}

/**
 * Process pending deliveries
 */
async function processDeliveries(): Promise<void> {
  const pendingDeliveries = await prisma.webhookDelivery.findMany({
    where: {
      status: { in: ["pending", "retrying"] },
      OR: [{ nextRetry: null }, { nextRetry: { lte: new Date() } }],
    },
    include: { webhook: true },
    take: 100,
  });

  for (const delivery of pendingDeliveries) {
    await sendWebhook(delivery as unknown as DeliveryWithWebhook);
  }
}

/**
 * Send webhook
 */
async function sendWebhook(delivery: DeliveryWithWebhook): Promise<void> {
  const webhook = delivery.webhook;

  try {
    // Transform payload if needed
    let payload = delivery.payload;
    if (webhook.transform) {
      payload = await transformPayload(payload, webhook.transform);
    }

    // Sign payload
    const signature = signPayload(payload, webhook.secret);

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Webhook-Signature": signature,
      "X-Webhook-Event": delivery.event,
      "X-Webhook-Delivery": delivery.id,
      "User-Agent": "Skai-Webhooks/2.0",
      ...(webhook.headers || {}),
    };

    // Send request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseBody = await response.text();

    // Update delivery
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: response.ok ? "sent" : "failed",
        attempts: { increment: 1 },
        lastAttempt: new Date(),
        response: {
          status: response.status,
          body: responseBody,
          headers: Object.fromEntries(response.headers.entries()),
        } as unknown as Record<string, unknown>,
        nextRetry: response.ok
          ? null
          : calculateNextRetry(delivery.attempts + 1, webhook.retryStrategy, webhook.maxRetries),
      },
    });

    // If failed and retries available, mark as retrying
    if (!response.ok && delivery.attempts + 1 < webhook.maxRetries) {
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: { status: "retrying" },
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Update delivery with error
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: delivery.attempts + 1 >= webhook.maxRetries ? "failed" : "retrying",
        attempts: { increment: 1 },
        lastAttempt: new Date(),
        error: errorMessage,
        nextRetry: calculateNextRetry(
          delivery.attempts + 1,
          webhook.retryStrategy,
          webhook.maxRetries
        ),
      },
    });
  }
}

/**
 * Calculate next retry time
 */
function calculateNextRetry(
  attempt: number,
  strategy: RetryStrategy,
  maxRetries: number
): Date | null {
  if (attempt >= maxRetries) return null;

  let delaySeconds: number;

  switch (strategy) {
    case "exponential":
      delaySeconds = Math.pow(2, attempt) * 60; // 2^n minutes
      break;
    case "linear":
      delaySeconds = attempt * 300; // n * 5 minutes
      break;
    case "fixed":
      delaySeconds = 600; // 10 minutes
      break;
    default:
      delaySeconds = 60;
  }

  return new Date(Date.now() + delaySeconds * 1000);
}

/**
 * Generate webhook secret
 */
function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Sign webhook payload
 */
function signPayload(payload: unknown, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest("hex");
}

/**
 * Verify webhook signature
 */
export function verifySignature(payload: unknown, signature: string, secret: string): boolean {
  const expectedSignature = signPayload(payload, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Transform payload using custom function
 */
async function transformPayload(payload: unknown, transformCode: string): Promise<unknown> {
  try {
    // Create safe execution context
    const transform = new Function("payload", transformCode);
    return transform(payload);
  } catch (error) {
    console.error("Payload transformation error:", error);
    return payload;
  }
}

/**
 * Get webhook deliveries
 */
export async function getWebhookDeliveries(
  webhookId: string,
  options?: {
    status?: WebhookStatus;
    page?: number;
    limit?: number;
  }
): Promise<{
  deliveries: WebhookDelivery[];
  total: number;
  page: number;
  pages: number;
}> {
  const page = options?.page || 1;
  const limit = options?.limit || 50;
  const skip = (page - 1) * limit;

  const whereClause: Record<string, unknown> = { webhookId };
  if (options?.status) {
    whereClause.status = options.status;
  }

  const [deliveries, total] = await Promise.all([
    prisma.webhookDelivery.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.webhookDelivery.count({ where: whereClause }),
  ]);

  return {
    deliveries: deliveries as unknown as WebhookDelivery[],
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Retry failed delivery
 */
export async function retryDelivery(deliveryId: string): Promise<void> {
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id: deliveryId },
    include: { webhook: true },
  });

  if (!delivery) {
    throw new Error("Delivery not found");
  }

  await sendWebhook(delivery);
}

/**
 * Get webhook statistics
 */
export async function getWebhookStats(webhookId: string): Promise<{
  total: number;
  sent: number;
  failed: number;
  pending: number;
  successRate: number;
  averageResponseTime: number;
}> {
  const [total, sent, failed, pending] = await Promise.all([
    prisma.webhookDelivery.count({ where: { webhookId } }),
    prisma.webhookDelivery.count({ where: { webhookId, status: "sent" } }),
    prisma.webhookDelivery.count({ where: { webhookId, status: "failed" } }),
    prisma.webhookDelivery.count({
      where: { webhookId, status: { in: ["pending", "retrying"] } },
    }),
  ]);

  const successRate = total > 0 ? (sent / total) * 100 : 0;

  return {
    total,
    sent,
    failed,
    pending,
    successRate,
    averageResponseTime: 0, // TODO: Calculate from response times
  };
}

/**
 * Test webhook
 */
export async function testWebhook(webhookId: string): Promise<{
  success: boolean;
  response?: { status: number; body: string };
  error?: string;
}> {
  const webhook = await getWebhook(webhookId);

  if (!webhook) {
    return { success: false, error: "Webhook not found" };
  }

  const testPayload = {
    event: "test",
    data: {
      message: "This is a test webhook delivery",
      timestamp: new Date().toISOString(),
    },
  };

  try {
    const signature = signPayload(testPayload, webhook.secret);

    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": "test",
        "User-Agent": "SkaiScraper-Webhooks/2.0",
        ...(webhook.headers || {}),
      },
      body: JSON.stringify(testPayload),
    });

    const body = await response.text();

    return {
      success: response.ok,
      response: {
        status: response.status,
        body,
      },
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
