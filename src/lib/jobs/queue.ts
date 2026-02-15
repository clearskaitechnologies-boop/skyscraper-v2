/**
 * Job Queue with Retry Policy
 * Uses Redis for persistent job storage
 * Automatically retries failed jobs with exponential backoff
 */

import { createRedisClientSafely } from "@/lib/upstash";

export interface JobOptions {
  /** Job type identifier */
  type: string;
  /** Job payload data */
  data: Record<string, any>;
  /** Max retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in ms for first retry (default: 1000) */
  initialDelayMs?: number;
  /** Exponential backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Idempotency key (prevents duplicate processing) */
  idempotencyKey?: string;
  /** Priority (higher = processed first) */
  priority?: number;
}

export interface Job {
  id: string;
  type: string;
  data: Record<string, any>;
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  maxRetries: number;
  lastError?: string;
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
  idempotencyKey?: string;
  priority: number;
}

const JOB_PREFIX = "job:";
const QUEUE_PREFIX = "queue:";
const IDEMPOTENCY_PREFIX = "idempotency:";
const IDEMPOTENCY_TTL = 86400; // 24 hours

/**
 * Add job to queue
 * Returns job ID or existing job ID if idempotency key matches
 */
export async function enqueueJob(options: JobOptions): Promise<string> {
  const redis = createRedisClientSafely();
  if (!redis) {
    console.warn("[QUEUE] Redis unavailable, job will not be queued");
    return `fallback_${Date.now()}`;
  }

  try {
    // Check idempotency key
    if (options.idempotencyKey) {
      const existing = await redis.get(`${IDEMPOTENCY_PREFIX}${options.idempotencyKey}`);
      if (existing) {
        console.log(`[QUEUE] Duplicate job detected, returning existing: ${existing}`);
        return existing as string;
      }
    }

    const jobId = `${JOB_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const job: Job = {
      id: jobId,
      type: options.type,
      data: options.data,
      status: "pending",
      attempts: 0,
      maxRetries: options.maxRetries ?? 3,
      createdAt: new Date().toISOString(),
      idempotencyKey: options.idempotencyKey,
      priority: options.priority ?? 0,
    };

    // Save job
    await redis.set(jobId, JSON.stringify(job));

    // Add to queue (sorted set by priority + created time)
    const score = options.priority ?? 0;
    await redis.zadd(`${QUEUE_PREFIX}${options.type}`, { score, member: jobId });

    // Store idempotency key if provided
    if (options.idempotencyKey) {
      await redis.setex(`${IDEMPOTENCY_PREFIX}${options.idempotencyKey}`, IDEMPOTENCY_TTL, jobId);
    }

    console.log(`[QUEUE] Enqueued job ${jobId} (type: ${options.type}, priority: ${score})`);
    return jobId;
  } catch (error) {
    console.error("[QUEUE] Failed to enqueue job:", error);
    return `fallback_${Date.now()}`;
  }
}

/**
 * Get next job from queue for processing
 * Returns null if queue is empty
 */
export async function dequeueJob(type: string): Promise<Job | null> {
  const redis = createRedisClientSafely();
  if (!redis) return null;

  try {
    // Get highest priority job (highest score first)
    const queueKey = `${QUEUE_PREFIX}${type}`;
    const jobIds = await redis.zrange(queueKey, 0, 0, { rev: true });

    if (!jobIds || jobIds.length === 0) {
      return null;
    }

    const jobId = jobIds[0];

    // Remove from queue
    await redis.zrem(queueKey, jobId);

    // Fetch job details
    const jobData = await redis.get(jobId);
    if (!jobData) {
      console.warn(`[QUEUE] Job ${jobId} not found`);
      return null;
    }

    const job: Job = JSON.parse(jobData as string);

    // Update status
    job.status = "processing";
    job.processedAt = new Date().toISOString();
    job.attempts += 1;

    await redis.set(jobId, JSON.stringify(job));

    return job;
  } catch (error) {
    console.error("[QUEUE] Failed to dequeue job:", error);
    return null;
  }
}

/**
 * Mark job as completed
 */
export async function completeJob(jobId: string): Promise<void> {
  const redis = createRedisClientSafely();
  if (!redis) return;

  try {
    const jobData = await redis.get(jobId);
    if (!jobData) return;

    const job: Job = JSON.parse(jobData as string);
    job.status = "completed";
    job.completedAt = new Date().toISOString();

    await redis.set(jobId, JSON.stringify(job));

    console.log(`[QUEUE] Job ${jobId} completed after ${job.attempts} attempts`);

    // Schedule cleanup (delete after 1 hour)
    await redis.expire(jobId, 3600);
  } catch (error) {
    console.error("[QUEUE] Failed to complete job:", error);
  }
}

/**
 * Mark job as failed and retry if attempts remain
 * Returns true if job should be retried
 */
export async function failJob(
  jobId: string,
  error: Error,
  options?: { initialDelayMs?: number; backoffMultiplier?: number }
): Promise<boolean> {
  const redis = createRedisClientSafely();
  if (!redis) return false;

  try {
    const jobData = await redis.get(jobId);
    if (!jobData) return false;

    const job: Job = JSON.parse(jobData as string);
    job.lastError = error.message;

    // Check if should retry
    if (job.attempts < job.maxRetries) {
      // Calculate backoff delay
      const initialDelay = options?.initialDelayMs ?? 1000;
      const multiplier = options?.backoffMultiplier ?? 2;
      const delayMs = initialDelay * Math.pow(multiplier, job.attempts - 1);

      console.log(
        `[QUEUE] Job ${jobId} failed (attempt ${job.attempts}/${job.maxRetries}), retrying in ${delayMs}ms`
      );

      // Re-queue with delay (use score as timestamp for delayed execution)
      job.status = "pending";
      await redis.set(jobId, JSON.stringify(job));

      const score = Date.now() + delayMs;
      await redis.zadd(`${QUEUE_PREFIX}${job.type}`, { score, member: jobId });

      return true;
    } else {
      // Max retries exceeded
      job.status = "failed";
      job.completedAt = new Date().toISOString();
      await redis.set(jobId, JSON.stringify(job));

      console.error(
        `[QUEUE] Job ${jobId} failed permanently after ${job.attempts} attempts: ${error.message}`
      );

      // Keep failed jobs for 24 hours for debugging
      await redis.expire(jobId, 86400);
      return false;
    }
  } catch (error) {
    console.error("[QUEUE] Failed to process job failure:", error);
    return false;
  }
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<Job | null> {
  const redis = createRedisClientSafely();
  if (!redis) return null;

  try {
    const jobData = await redis.get(jobId);
    if (!jobData) return null;

    return JSON.parse(jobData as string);
  } catch (error) {
    console.error("[QUEUE] Failed to get job status:", error);
    return null;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(type: string): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}> {
  const redis = createRedisClientSafely();
  if (!redis) return { pending: 0, processing: 0, completed: 0, failed: 0 };

  try {
    const queueKey = `${QUEUE_PREFIX}${type}`;
    const pending = await redis.zcard(queueKey);

    // This is expensive - would need better tracking in production
    // For now, just return pending count
    return {
      pending,
      processing: 0,
      completed: 0,
      failed: 0,
    };
  } catch (error) {
    console.error("[QUEUE] Failed to get queue stats:", error);
    return { pending: 0, processing: 0, completed: 0, failed: 0 };
  }
}

/**
 * Process jobs in queue (worker function)
 * Call this in a worker process or cron job
 */
export async function processJobs(
  type: string,
  handler: (job: Job) => Promise<void>,
  options: {
    maxConcurrent?: number;
    pollIntervalMs?: number;
    stopAfterOne?: boolean;
  } = {}
): Promise<void> {
  const { maxConcurrent = 1, pollIntervalMs = 1000, stopAfterOne = false } = options;

  console.log(`[QUEUE] Starting worker for ${type} (max concurrent: ${maxConcurrent})`);

  let running = true;
  let activeJobs = 0;

  while (running) {
    try {
      // Check if we can process more jobs
      if (activeJobs < maxConcurrent) {
        const job = await dequeueJob(type);

        if (job) {
          activeJobs++;

          // Process job asynchronously
          handler(job)
            .then(async () => {
              await completeJob(job.id);
              activeJobs--;
            })
            .catch(async (error) => {
              await failJob(job.id, error);
              activeJobs--;
            });

          if (stopAfterOne) {
            running = false;
          }
        } else {
          // Queue is empty, wait before polling again
          await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
        }
      } else {
        // Max concurrent reached, wait before checking again
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("[QUEUE] Worker error:", error);
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }
}
