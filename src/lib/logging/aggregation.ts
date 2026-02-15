/**
 * TASK 160: LOG AGGREGATION
 *
 * Centralized logging with structured log parsing.
 */

import prisma from "@/lib/prisma";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  service: string;
  message: string;
  fields: Record<string, any>;
  traceId?: string;
  userId?: string;
  tenantId?: string;
}

/**
 * Ingest log entry
 */
export async function ingestLog(entry: Omit<LogEntry, "id">): Promise<void> {
  await prisma.logEntry.create({
    data: {
      ...entry,
      fields: entry.fields as any,
    } as any,
  });
}

/**
 * Batch ingest logs
 */
export async function batchIngestLogs(entries: Omit<LogEntry, "id">[]): Promise<number> {
  await prisma.logEntry.createMany({
    data: entries.map((e) => ({
      ...e,
      fields: e.fields as any,
    })) as any,
  });

  return entries.length;
}

/**
 * Query logs
 */
export async function queryLogs(filters: {
  level?: LogLevel[];
  service?: string;
  startTime?: Date;
  endTime?: Date;
  search?: string;
  traceId?: string;
  userId?: string;
  tenantId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: LogEntry[]; total: number }> {
  const where: any = {};

  if (filters.level && filters.level.length > 0) {
    where.level = { in: filters.level };
  }

  if (filters.service) {
    where.service = filters.service;
  }

  if (filters.startTime || filters.endTime) {
    where.timestamp = {};
    if (filters.startTime) where.timestamp.gte = filters.startTime;
    if (filters.endTime) where.timestamp.lte = filters.endTime;
  }

  if (filters.search) {
    where.message = { contains: filters.search, mode: "insensitive" };
  }

  if (filters.traceId) {
    where.traceId = filters.traceId;
  }

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.tenantId) {
    where.tenantId = filters.tenantId;
  }

  const [logs, total] = await Promise.all([
    prisma.logEntry.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    }),
    prisma.logEntry.count({ where }),
  ]);

  return {
    logs: logs as any,
    total,
  };
}

/**
 * Get log statistics
 */
export async function getLogStats(timeWindow: number = 3600): Promise<{
  byLevel: Record<LogLevel, number>;
  byService: { service: string; count: number }[];
  errorRate: number;
}> {
  const since = new Date(Date.now() - timeWindow * 1000);

  const logs = await prisma.logEntry.findMany({
    where: { timestamp: { gte: since } },
    select: { level: true, service: true },
  });

  const byLevel: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 0,
    WARN: 0,
    ERROR: 0,
    FATAL: 0,
  };

  const serviceMap = new Map<string, number>();

  for (const log of logs) {
    byLevel[log.level as LogLevel]++;

    const count = serviceMap.get(log.service) || 0;
    serviceMap.set(log.service, count + 1);
  }

  const byService = Array.from(serviceMap.entries())
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const errorCount = byLevel.ERROR + byLevel.FATAL;
  const errorRate = logs.length > 0 ? (errorCount / logs.length) * 100 : 0;

  return {
    byLevel,
    byService,
    errorRate,
  };
}

/**
 * Tail logs (real-time streaming)
 */
export async function* tailLogs(filters: {
  service?: string;
  level?: LogLevel[];
}): AsyncGenerator<LogEntry> {
  while (true) {
    const logs = await queryLogs({
      ...filters,
      limit: 10,
      startTime: new Date(Date.now() - 5000),
    });

    for (const log of logs.logs) {
      yield log;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

/**
 * Archive old logs
 */
export async function archiveLogs(olderThanDays: number): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const result = await prisma.logEntry.deleteMany({
    where: { timestamp: { lt: cutoff } },
  });

  return result.count;
}

/**
 * Get error frequency
 */
export async function getErrorFrequency(
  timeWindow: number = 3600,
  buckets: number = 12
): Promise<{ timestamp: Date; count: number }[]> {
  const bucketSize = timeWindow / buckets;
  const result: { timestamp: Date; count: number }[] = [];

  for (let i = buckets - 1; i >= 0; i--) {
    const start = new Date(Date.now() - (i + 1) * bucketSize * 1000);
    const end = new Date(Date.now() - i * bucketSize * 1000);

    const count = await prisma.logEntry.count({
      where: {
        level: { in: ["ERROR", "FATAL"] },
        timestamp: { gte: start, lt: end },
      },
    });

    result.push({ timestamp: end, count });
  }

  return result;
}
