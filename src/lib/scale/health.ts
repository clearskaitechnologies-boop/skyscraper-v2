/**
 * src/lib/scale/health.ts
 *
 * Runtime health checks for 10K-user scale monitoring.
 * Used by /api/health endpoints and observability dashboards.
 */

import prisma from "@/lib/prisma";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  database: {
    connected: boolean;
    latencyMs: number;
    activeConnections?: number;
  };
  cache: {
    available: boolean;
    latencyMs: number;
  };
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    percentUsed: number;
  };
  uptime: number;
  timestamp: string;
}

/**
 * Full system health check — call from /api/health/deep
 */
export async function deepHealthCheck(): Promise<HealthCheck> {
  const start = Date.now();
  let dbConnected = false;
  let dbLatency = 0;
  let cacheAvailable = false;
  let cacheLatency = 0;

  // ── Database check ──────────────────────────────────────────────
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    dbConnected = true;
  } catch {
    dbLatency = Date.now() - start;
  }

  // ── Cache check (Upstash Redis) ─────────────────────────────────
  try {
    const cacheStart = Date.now();
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
        signal: AbortSignal.timeout(3000),
      });
      cacheAvailable = res.ok;
    }
    cacheLatency = Date.now() - cacheStart;
  } catch {
    cacheLatency = Date.now() - start;
  }

  // ── Memory ──────────────────────────────────────────────────────
  const mem = process.memoryUsage();
  const heapUsedMB = Math.round(mem.heapUsed / 1_048_576);
  const heapTotalMB = Math.round(mem.heapTotal / 1_048_576);
  const rssMB = Math.round(mem.rss / 1_048_576);

  // ── Overall status ──────────────────────────────────────────────
  let status: HealthCheck["status"] = "healthy";
  if (!dbConnected) status = "unhealthy";
  else if (dbLatency > 500 || !cacheAvailable) status = "degraded";

  return {
    status,
    database: { connected: dbConnected, latencyMs: dbLatency },
    cache: { available: cacheAvailable, latencyMs: cacheLatency },
    memory: {
      heapUsedMB,
      heapTotalMB,
      rssMB,
      percentUsed: Math.round((heapUsedMB / heapTotalMB) * 100),
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}
