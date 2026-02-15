/**
 * Performance Monitoring System
 *
 * APM integration, slow query detection, metrics collection
 * Track application performance and identify bottlenecks
 */

import prisma from "@/lib/prisma";

export interface PerformanceMetric {
  id: string;
  metricType: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SlowQuery {
  id: string;
  query: string;
  duration: number;
  timestamp: Date;
  stackTrace?: string;
  parameters?: any;
}

export interface APMTrace {
  id: string;
  name: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  spans: APMSpan[];
  metadata?: Record<string, any>;
}

export interface APMSpan {
  name: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  tags?: Record<string, any>;
}

/**
 * Record performance metric
 */
export async function recordMetric(
  metricType: string,
  value: number,
  unit: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await prisma.performanceMetrics.create({
      data: {
        metricType,
        value,
        unit,
        timestamp: new Date(),
        metadata: metadata || {},
      },
    });
  } catch (error) {
    console.error("Failed to record metric:", error);
  }
}

/**
 * Record slow query
 */
export async function recordSlowQuery(
  query: string,
  duration: number,
  parameters?: any,
  stackTrace?: string
): Promise<void> {
  try {
    await prisma.slowQueries.create({
      data: {
        query,
        duration,
        timestamp: new Date(),
        parameters,
        stackTrace,
      },
    });

    // Alert if extremely slow (>5s)
    if (duration > 5000) {
      console.warn(`CRITICAL: Query took ${duration}ms`, {
        query: query.substring(0, 200),
      });
    }
  } catch (error) {
    console.error("Failed to record slow query:", error);
  }
}

/**
 * Start APM trace
 */
export function startTrace(name: string): APMTraceContext {
  return new APMTraceContext(name);
}

/**
 * APM Trace Context
 */
class APMTraceContext {
  private name: string;
  private startTime: Date;
  private spans: APMSpan[] = [];
  private metadata: Record<string, any> = {};

  constructor(name: string) {
    this.name = name;
    this.startTime = new Date();
  }

  /**
   * Add span to trace
   */
  span(name: string): APMSpanContext {
    return new APMSpanContext(this, name);
  }

  /**
   * Add metadata to trace
   */
  setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  /**
   * Add span (internal)
   */
  addSpan(span: APMSpan): void {
    this.spans.push(span);
  }

  /**
   * End trace and record
   */
  async end(): Promise<void> {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    try {
      await prisma.apmTraces.create({
        data: {
          name: this.name,
          duration,
          startTime: this.startTime,
          endTime,
          spans: this.spans,
          metadata: this.metadata,
        },
      });

      // Alert if slow
      if (duration > 3000) {
        console.warn(`Slow trace: ${this.name} took ${duration}ms`);
      }
    } catch (error) {
      console.error("Failed to record APM trace:", error);
    }
  }
}

/**
 * APM Span Context
 */
class APMSpanContext {
  private trace: APMTraceContext;
  private name: string;
  private startTime: Date;
  private tags: Record<string, any> = {};

  constructor(trace: APMTraceContext, name: string) {
    this.trace = trace;
    this.name = name;
    this.startTime = new Date();
  }

  /**
   * Add tag to span
   */
  setTag(key: string, value: any): void {
    this.tags[key] = value;
  }

  /**
   * End span
   */
  end(): void {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    this.trace.addSpan({
      name: this.name,
      duration,
      startTime: this.startTime,
      endTime,
      tags: this.tags,
    });
  }
}

/**
 * Monitor database query performance
 */
export async function monitorQuery<T>(
  query: () => Promise<T>,
  queryName: string,
  slowThreshold: number = 1000
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await query();
    const duration = Date.now() - startTime;

    // Record if slow
    if (duration > slowThreshold) {
      await recordSlowQuery(queryName, duration);
    }

    // Record metric
    await recordMetric("query_duration", duration, "ms", {
      queryName,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    await recordMetric("query_error", duration, "ms", {
      queryName,
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Get performance metrics
 */
export async function getMetrics(
  metricType: string,
  startDate: Date,
  endDate: Date
): Promise<PerformanceMetric[]> {
  try {
    const metrics = await prisma.performanceMetrics.findMany({
      where: {
        metricType,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: "asc" },
    });

    return metrics as any[];
  } catch {
    return [];
  }
}

/**
 * Get slow queries
 */
export async function getSlowQueries(
  limit: number = 50,
  minDuration: number = 1000
): Promise<SlowQuery[]> {
  try {
    const queries = await prisma.slowQueries.findMany({
      where: {
        duration: { gte: minDuration },
      },
      orderBy: { duration: "desc" },
      take: limit,
    });

    return queries as any[];
  } catch {
    return [];
  }
}

/**
 * Get metrics summary
 */
export async function getMetricsSummary(
  metricType: string,
  startDate: Date,
  endDate: Date
): Promise<{
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
  count: number;
}> {
  try {
    const metrics = await getMetrics(metricType, startDate, endDate);

    if (metrics.length === 0) {
      return {
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        count: 0,
      };
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      avg: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p50: values[Math.floor(values.length * 0.5)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
      count: values.length,
    };
  } catch (error) {
    console.error("Failed to get metrics summary:", error);
    return {
      avg: 0,
      min: 0,
      max: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      count: 0,
    };
  }
}

/**
 * Get system health metrics
 */
export async function getSystemHealth(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  metrics: {
    avgResponseTime: number;
    errorRate: number;
    slowQueryCount: number;
    activeTraces: number;
  };
  issues: string[];
}> {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get metrics
    const [responseTimes, errors, slowQueries] = await Promise.all([
      getMetrics("response_time", oneHourAgo, now),
      getMetrics("error", oneHourAgo, now),
      getSlowQueries(100, 1000),
    ]);

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, m) => sum + m.value, 0) / responseTimes.length
        : 0;

    const errorRate = errors.length / Math.max(responseTimes.length, 1);

    const issues: string[] = [];
    let status: "healthy" | "degraded" | "unhealthy" = "healthy";

    // Check response time
    if (avgResponseTime > 3000) {
      issues.push("High average response time");
      status = "degraded";
    }

    // Check error rate
    if (errorRate > 0.05) {
      issues.push("High error rate");
      status = "unhealthy";
    }

    // Check slow queries
    if (slowQueries.length > 20) {
      issues.push("Many slow queries detected");
      status = status === "unhealthy" ? "unhealthy" : "degraded";
    }

    return {
      status,
      metrics: {
        avgResponseTime,
        errorRate,
        slowQueryCount: slowQueries.length,
        activeTraces: 0, // TODO: Implement active trace counting
      },
      issues,
    };
  } catch (error) {
    console.error("Failed to get system health:", error);
    return {
      status: "unhealthy",
      metrics: {
        avgResponseTime: 0,
        errorRate: 0,
        slowQueryCount: 0,
        activeTraces: 0,
      },
      issues: ["Failed to retrieve health metrics"],
    };
  }
}

/**
 * Middleware for automatic performance tracking
 */
export function performanceMiddleware(handler: any) {
  return async (req: any, res: any) => {
    const trace = startTrace(`${req.method} ${req.url}`);
    const startTime = Date.now();

    try {
      // Execute handler
      const result = await handler(req, res);

      // Record success
      const duration = Date.now() - startTime;
      await recordMetric("response_time", duration, "ms", {
        method: req.method,
        url: req.url,
        status: res.statusCode || 200,
      });

      await trace.end();
      return result;
    } catch (error) {
      // Record error
      const duration = Date.now() - startTime;
      await recordMetric("error", duration, "ms", {
        method: req.method,
        url: req.url,
        error: (error as Error).message,
      });

      await trace.end();
      throw error;
    }
  };
}

/**
 * Cleanup old metrics
 */
export async function cleanupOldMetrics(retentionDays: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const [metricsDeleted, queriesDeleted, tracesDeleted] = await Promise.all([
      prisma.performanceMetrics.deleteMany({
        where: { timestamp: { lt: cutoffDate } },
      }),
      prisma.slowQueries.deleteMany({
        where: { timestamp: { lt: cutoffDate } },
      }),
      prisma.apmTraces.deleteMany({
        where: { startTime: { lt: cutoffDate } },
      }),
    ]);

    return metricsDeleted.count + queriesDeleted.count + tracesDeleted.count;
  } catch {
    return 0;
  }
}

/**
 * Real-time performance dashboard data
 */
export async function getDashboardData(): Promise<{
  currentMetrics: {
    avgResponseTime: number;
    requestsPerMinute: number;
    errorRate: number;
    activeUsers: number;
  };
  recentSlowQueries: SlowQuery[];
  recentErrors: PerformanceMetric[];
  systemHealth: Awaited<ReturnType<typeof getSystemHealth>>;
}> {
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [responseMetrics, errorMetrics, slowQueries, health] = await Promise.all([
      getMetrics("response_time", oneMinuteAgo, now),
      getMetrics("error", fiveMinutesAgo, now),
      getSlowQueries(10, 1000),
      getSystemHealth(),
    ]);

    const avgResponseTime =
      responseMetrics.length > 0
        ? responseMetrics.reduce((sum, m) => sum + m.value, 0) / responseMetrics.length
        : 0;

    return {
      currentMetrics: {
        avgResponseTime,
        requestsPerMinute: responseMetrics.length,
        errorRate: errorMetrics.length / Math.max(responseMetrics.length, 1),
        activeUsers: 0, // TODO: Implement active user tracking
      },
      recentSlowQueries: slowQueries,
      recentErrors: errorMetrics,
      systemHealth: health,
    };
  } catch (error) {
    console.error("Failed to get dashboard data:", error);
    throw error;
  }
}
