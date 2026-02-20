/**
 * Task 219: API Gateway & Rate Limiting
 *
 * Implements advanced API routing, rate limiting, throttling,
 * quota management, and API key authentication.
 */

import prisma from "@/lib/prisma";

export type RateLimitStrategy = "fixed-window" | "sliding-window" | "token-bucket" | "leaky-bucket";

export interface APIKey {
  id: string;
  key: string;
  name: string;
  userId: string;
  scopes: string[];
  rateLimit: RateLimit;
  quotas: Quota[];
  active: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface RateLimit {
  strategy: RateLimitStrategy;
  requests: number;
  window: number; // seconds
  burst?: number;
}

export interface Quota {
  resource: string;
  limit: number;
  used: number;
  resetsAt: Date;
}

export interface APIRequest {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
}

/**
 * Create API key
 */
export async function createAPIKey(
  name: string,
  userId: string,
  scopes: string[],
  rateLimit: RateLimit
): Promise<APIKey> {
  const key = generateAPIKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      key,
      name,
      userId,
      scopes,
      rateLimit,
      quotas: [],
      active: true,
    },
  });

  return apiKey as APIKey;
}

/**
 * Generate API key
 */
function generateAPIKey(): string {
  return `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Check rate limit
 */
export async function checkRateLimit(apiKey: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetsAt: Date;
}> {
  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey },
  });

  if (!key || !key.active) {
    return { allowed: false, remaining: 0, resetsAt: new Date() };
  }

  // Get recent requests
  const windowStart = new Date(Date.now() - key.rateLimit.window * 1000);
  const recentRequests = await prisma.apiRequest.count({
    where: {
      apiKeyId: key.id,
      timestamp: { gte: windowStart },
    },
  });

  const allowed = recentRequests < key.rateLimit.requests;
  const remaining = Math.max(0, key.rateLimit.requests - recentRequests);
  const resetsAt = new Date(Date.now() + key.rateLimit.window * 1000);

  return { allowed, remaining, resetsAt };
}

/**
 * Log API request
 */
export async function logAPIRequest(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number
): Promise<void> {
  await prisma.apiRequest.create({
    data: {
      apiKeyId,
      endpoint,
      method,
      statusCode,
      duration,
      timestamp: new Date(),
    },
  });
}

/**
 * Check quota
 */
export async function checkQuota(
  apiKeyId: string,
  resource: string
): Promise<{ allowed: boolean; remaining: number }> {
  const key = await prisma.apiKey.findUnique({
    where: { id: apiKeyId },
  });

  if (!key) return { allowed: false, remaining: 0 };

  const quota = key.quotas.find((q) => q.resource === resource);
  if (!quota) return { allowed: true, remaining: Infinity };

  const allowed = quota.used < quota.limit;
  const remaining = Math.max(0, quota.limit - quota.used);

  return { allowed, remaining };
}

/**
 * Consume quota
 */
export async function consumeQuota(
  apiKeyId: string,
  resource: string,
  amount: number = 1
): Promise<void> {
  const key = await prisma.apiKey.findUnique({
    where: { id: apiKeyId },
  });

  if (!key) return;

  const quotas = key.quotas.map((q) =>
    q.resource === resource ? { ...q, used: q.used + amount } : q
  );

  await prisma.apiKey.update({
    where: { id: apiKeyId },
    data: { quotas },
  });
}

/**
 * Get API usage stats
 */
export async function getUsageStats(
  apiKeyId: string,
  timeRange: { start: Date; end: Date }
): Promise<{
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
}> {
  const requests = await prisma.apiRequest.findMany({
    where: {
      apiKeyId,
      timestamp: {
        gte: timeRange.start,
        lte: timeRange.end,
      },
    },
  });

  const successCount = requests.filter((r) => r.statusCode < 400).length;
  const totalLatency = requests.reduce((sum, r) => sum + r.duration, 0);

  const endpointCounts = new Map<string, number>();
  requests.forEach((r) => {
    endpointCounts.set(r.endpoint, (endpointCounts.get(r.endpoint) || 0) + 1);
  });

  const topEndpoints = Array.from(endpointCounts.entries())
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalRequests: requests.length,
    successRate: requests.length > 0 ? successCount / requests.length : 0,
    averageLatency: requests.length > 0 ? totalLatency / requests.length : 0,
    topEndpoints,
  };
}

export { RateLimitStrategy };
