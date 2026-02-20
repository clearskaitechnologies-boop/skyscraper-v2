/**
 * TASK 178: PERFORMANCE PROFILING
 *
 * Application performance monitoring and profiling.
 */

import prisma from "@/lib/prisma";

export interface PerformanceProfile {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  duration: number;
  cpuTime: number;
  memoryUsage: number;
  dbQueries: number;
  dbTime: number;
  timestamp: Date;
  traces: ProfileTrace[];
}

export interface ProfileTrace {
  function: string;
  duration: number;
  callCount: number;
  line: number;
  file: string;
}

/**
 * Start profiling
 */
export async function startProfiling(data: {
  name: string;
  endpoint: string;
  method: string;
}): Promise<string> {
  const profile = await prisma.performanceProfile.create({
    data: {
      ...data,
      duration: 0,
      cpuTime: 0,
      memoryUsage: 0,
      dbQueries: 0,
      dbTime: 0,
      timestamp: new Date(),
      traces: [],
    } as any,
  });

  return profile.id;
}

/**
 * End profiling
 */
export async function endProfiling(
  profileId: string,
  metrics: {
    duration: number;
    cpuTime: number;
    memoryUsage: number;
    dbQueries: number;
    dbTime: number;
    traces: ProfileTrace[];
  }
): Promise<void> {
  await prisma.performanceProfile.update({
    where: { id: profileId },
    data: {
      ...metrics,
      traces: metrics.traces as any,
    } as any,
  });
}

/**
 * Get slow endpoints
 */
export async function getSlowEndpoints(
  threshold: number = 1000,
  limit: number = 20
): Promise<
  {
    endpoint: string;
    method: string;
    avgDuration: number;
    count: number;
  }[]
> {
  const profiles = await prisma.performanceProfile.groupBy({
    by: ["endpoint", "method"],
    _avg: { duration: true },
    _count: { id: true },
    having: {
      duration: { _avg: { gte: threshold } },
    },
    orderBy: { _avg: { duration: "desc" } },
    take: limit,
  });

  return profiles.map((p) => ({
    endpoint: p.endpoint,
    method: p.method,
    avgDuration: p._avg.duration || 0,
    count: p._count.id,
  }));
}

/**
 * Get hotspots
 */
export async function getHotspots(profileId: string): Promise<ProfileTrace[]> {
  const profile = await prisma.performanceProfile.findUnique({
    where: { id: profileId },
  });

  if (!profile) return [];

  const traces = profile.traces as ProfileTrace[];

  return traces.sort((a, b) => b.duration - a.duration).slice(0, 10);
}

/**
 * Get memory leaks
 */
export async function detectMemoryLeaks(
  endpoint: string,
  timeWindow: number = 3600
): Promise<{
  detected: boolean;
  trend: number;
  samples: { timestamp: Date; memory: number }[];
}> {
  const since = new Date(Date.now() - timeWindow * 1000);

  const profiles = await prisma.performanceProfile.findMany({
    where: {
      endpoint,
      timestamp: { gte: since },
    },
    orderBy: { timestamp: "asc" },
    select: { timestamp: true, memoryUsage: true },
  });

  if (profiles.length < 2) {
    return { detected: false, trend: 0, samples: [] };
  }

  // Calculate trend
  const firstHalf = profiles.slice(0, Math.floor(profiles.length / 2));
  const secondHalf = profiles.slice(Math.floor(profiles.length / 2));

  const avgFirst = firstHalf.reduce((sum, p) => sum + p.memoryUsage, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, p) => sum + p.memoryUsage, 0) / secondHalf.length;

  const trend = ((avgSecond - avgFirst) / avgFirst) * 100;

  return {
    detected: trend > 20, // 20% increase
    trend,
    samples: profiles.map((p) => ({
      timestamp: p.timestamp,
      memory: p.memoryUsage,
    })),
  };
}

/**
 * Get database bottlenecks
 */
export async function getDatabaseBottlenecks(limit: number = 10): Promise<
  {
    endpoint: string;
    method: string;
    avgDbTime: number;
    avgQueries: number;
    ratio: number;
  }[]
> {
  const profiles = await prisma.performanceProfile.groupBy({
    by: ["endpoint", "method"],
    _avg: { dbTime: true, duration: true, dbQueries: true },
    orderBy: { _avg: { dbTime: "desc" } },
    take: limit,
  });

  return profiles.map((p) => ({
    endpoint: p.endpoint,
    method: p.method,
    avgDbTime: p._avg.dbTime || 0,
    avgQueries: p._avg.dbQueries || 0,
    ratio: p._avg.duration ? ((p._avg.dbTime || 0) / p._avg.duration) * 100 : 0,
  }));
}

/**
 * Get performance trends
 */
export async function getPerformanceTrends(
  endpoint: string,
  buckets: number = 12
): Promise<
  {
    timestamp: Date;
    avgDuration: number;
    p95Duration: number;
    count: number;
  }[]
> {
  const timeWindow = 3600; // 1 hour
  const bucketSize = timeWindow / buckets;

  const result: any[] = [];

  for (let i = buckets - 1; i >= 0; i--) {
    const start = new Date(Date.now() - (i + 1) * bucketSize * 1000);
    const end = new Date(Date.now() - i * bucketSize * 1000);

    const profiles = await prisma.performanceProfile.findMany({
      where: {
        endpoint,
        timestamp: { gte: start, lt: end },
      },
      select: { duration: true },
    });

    const durations = profiles.map((p) => p.duration).sort((a, b) => a - b);

    result.push({
      timestamp: end,
      avgDuration:
        durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
      p95Duration: durations[Math.floor(durations.length * 0.95)] || 0,
      count: durations.length,
    });
  }

  return result;
}

/**
 * Profile function execution
 */
export async function profileFunction<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  const startMemory = process.memoryUsage().heapUsed;

  const result = await fn();

  const duration = performance.now() - startTime;
  const memoryDelta = process.memoryUsage().heapUsed - startMemory;

  console.log(
    `[Profile] ${name}: ${duration.toFixed(2)}ms, ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`
  );

  return { result, duration };
}
