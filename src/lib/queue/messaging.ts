/**
 * TASK 153: MESSAGE QUEUES
 *
 * Distributed message queue with RabbitMQ/Redis patterns.
 */

import prisma from "@/lib/prisma";

export type QueueType = "STANDARD" | "FIFO" | "PRIORITY" | "DELAYED";

export interface Message {
  id: string;
  queueName: string;
  payload: Record<string, unknown>;
  priority: number;
  attempts: number;
  maxRetries: number;
  delayUntil?: Date;
  createdAt: Date;
  processedAt?: Date;
}

export interface Queue {
  name: string;
  type: QueueType;
  maxRetries: number;
  visibilityTimeout: number;
  deadLetterQueue?: string;
}

/**
 * Create queue
 */
export async function createQueue(queue: Queue): Promise<void> {
  await prisma.messageQueue.create({
    data: queue as unknown as Record<string, unknown>,
  });
}

/**
 * Publish message to queue
 */
export async function publishMessage(
  queueName: string,
  payload: Record<string, unknown>,
  options?: {
    priority?: number;
    delay?: number;
    maxRetries?: number;
  }
): Promise<string> {
  const delayUntil = options?.delay ? new Date(Date.now() + options.delay * 1000) : undefined;

  const message = await prisma.message.create({
    data: {
      queueName,
      payload: payload as unknown as Record<string, unknown>,
      priority: options?.priority || 0,
      attempts: 0,
      maxRetries: options?.maxRetries || 3,
      delayUntil,
      status: "PENDING",
    } as unknown as Record<string, unknown>,
  });

  return message.id;
}

/**
 * Consume message from queue
 */
export async function consumeMessage(queueName: string): Promise<Message | null> {
  const now = new Date();

  // Find next available message
  const message = await prisma.message.findFirst({
    where: {
      queueName,
      status: "PENDING",
      OR: [{ delayUntil: null }, { delayUntil: { lte: now } }],
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });

  if (!message) return null;

  // Mark as processing
  await prisma.message.update({
    where: { id: message.id },
    data: {
      status: "PROCESSING",
      attempts: { increment: 1 },
    } as unknown as Record<string, unknown>,
  });

  return message as unknown as Message;
}

/**
 * Acknowledge message (delete from queue)
 */
export async function acknowledgeMessage(messageId: string): Promise<void> {
  await prisma.message.update({
    where: { id: messageId },
    data: {
      status: "COMPLETED",
      processedAt: new Date(),
    } as unknown as Record<string, unknown>,
  });
}

/**
 * Reject message (requeue or send to DLQ)
 */
export async function rejectMessage(messageId: string, error?: string): Promise<void> {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) return;

  if (message.attempts >= message.maxRetries) {
    // Send to dead letter queue
    const queue = await prisma.messageQueue.findUnique({
      where: { name: message.queueName },
    });

    if (queue?.deadLetterQueue) {
      await publishMessage(queue.deadLetterQueue, {
        originalMessage: message.payload,
        error,
        attempts: message.attempts,
      });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { status: "FAILED" } as unknown as Record<string, unknown>,
    });
  } else {
    // Requeue with exponential backoff
    const delaySeconds = Math.pow(2, message.attempts) * 10;
    const delayUntil = new Date(Date.now() + delaySeconds * 1000);

    await prisma.message.update({
      where: { id: messageId },
      data: {
        status: "PENDING",
        delayUntil,
      } as unknown as Record<string, unknown>,
    });
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(queueName: string): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  avgProcessingTime: number;
}> {
  const [pending, processing, completed, failed] = await Promise.all([
    prisma.message.count({
      where: { queueName, status: "PENDING" },
    }),
    prisma.message.count({
      where: { queueName, status: "PROCESSING" },
    }),
    prisma.message.count({
      where: { queueName, status: "COMPLETED" },
    }),
    prisma.message.count({
      where: { queueName, status: "FAILED" },
    }),
  ]);

  const completedMessages = await prisma.message.findMany({
    where: {
      queueName,
      status: "COMPLETED",
      processedAt: { not: null },
    },
    take: 100,
  });

  const avgProcessingTime =
    completedMessages.length > 0
      ? completedMessages.reduce((sum, m) => {
          const duration = m.processedAt!.getTime() - m.createdAt.getTime();
          return sum + duration;
        }, 0) /
        completedMessages.length /
        1000
      : 0;

  return {
    pending,
    processing,
    completed,
    failed,
    avgProcessingTime,
  };
}

/**
 * Purge queue
 */
export async function purgeQueue(queueName: string): Promise<number> {
  const result = await prisma.message.deleteMany({
    where: {
      queueName,
      status: { in: ["PENDING", "COMPLETED", "FAILED"] },
    },
  });

  return result.count;
}

/**
 * Create worker to process queue
 */
export function createWorker(
  queueName: string,
  handler: (payload: Record<string, unknown>) => Promise<void>
): void {
  const processNext = async () => {
    const message = await consumeMessage(queueName);

    if (!message) {
      setTimeout(processNext, 1000);
      return;
    }

    try {
      await handler(message.payload);
      await acknowledgeMessage(message.id);
    } catch (error: unknown) {
      // Capture queue failure to Sentry
      if (typeof window === "undefined") {
        const Sentry = await import("@sentry/nextjs");
        Sentry.captureException(error, {
          tags: { subsystem: "queue", queue: "messaging" },
          extra: { messageId: message.id, queueName: message.queueName },
        });
      }
      await rejectMessage(message.id, error instanceof Error ? error.message : String(error));
    }

    // Process next immediately
    processNext();
  };

  // Start processing
  processNext();
}
