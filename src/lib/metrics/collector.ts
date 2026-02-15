/**
 * TASK 161: METRICS COLLECTION
 *
 * Prometheus-style metrics collection and aggregation.
 */

import prisma from "@/lib/prisma";

export type MetricType = "COUNTER" | "GAUGE" | "HISTOGRAM" | "SUMMARY";

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels: Record<string, string>;
  timestamp: Date;
}

export interface HistogramBucket {
  le: number;
  count: number;
}

/**
 * Record counter metric
 */
export async function recordCounter(
  name: string,
  value: number = 1,
  labels: Record<string, string> = {}
): Promise<void> {
  await prisma.metric.create({
    data: {
      name,
      type: "COUNTER",
      value,
      labels: labels as any,
      timestamp: new Date(),
    } as any,
  });
}

/**
 * Record gauge metric
 */
export async function recordGauge(
  name: string,
  value: number,
  labels: Record<string, string> = {}
): Promise<void> {
  await prisma.metric.create({
    data: {
      name,
      type: "GAUGE",
      value,
      labels: labels as any,
      timestamp: new Date(),
    } as any,
  });
}

/**
 * Record histogram metric
 */
export async function recordHistogram(
  name: string,
  value: number,
  labels: Record<string, string> = {}
): Promise<void> {
  await prisma.metric.create({
    data: {
      name,
      type: "HISTOGRAM",
      value,
      labels: labels as any,
      timestamp: new Date(),
    } as any,
  });
}

/**
 * Query metrics
 */
export async function queryMetrics(filters: {
  name?: string;
  type?: MetricType;
  labels?: Record<string, string>;
  startTime?: Date;
  endTime?: Date;
}): Promise<Metric[]> {
  const where: any = {};

  if (filters.name) {
    where.name = filters.name;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.startTime || filters.endTime) {
    where.timestamp = {};
    if (filters.startTime) where.timestamp.gte = filters.startTime;
    if (filters.endTime) where.timestamp.lte = filters.endTime;
  }

  const metrics = await prisma.metric.findMany({
    where,
    orderBy: { timestamp: "desc" },
  });

  return metrics as any;
}

/**
 * Get metric aggregation
 */
export async function aggregateMetric(
  name: string,
  aggregation: "SUM" | "AVG" | "MIN" | "MAX" | "COUNT",
  timeWindow: number = 3600
): Promise<number> {
  const since = new Date(Date.now() - timeWindow * 1000);

  const result = await prisma.metric.aggregate({
    where: {
      name,
      timestamp: { gte: since },
    },
    _sum: { value: true },
    _avg: { value: true },
    _min: { value: true },
    _max: { value: true },
    _count: true,
  });

  switch (aggregation) {
    case "SUM":
      return result._sum.value || 0;
    case "AVG":
      return result._avg.value || 0;
    case "MIN":
      return result._min.value || 0;
    case "MAX":
      return result._max.value || 0;
    case "COUNT":
      return result._count;
    default:
      return 0;
  }
}

/**
 * Get histogram percentiles
 */
export async function getHistogramPercentiles(
  name: string,
  timeWindow: number = 3600
): Promise<{
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}> {
  const since = new Date(Date.now() - timeWindow * 1000);

  const metrics = await prisma.metric.findMany({
    where: {
      name,
      type: "HISTOGRAM",
      timestamp: { gte: since },
    },
    select: { value: true },
  });

  const values = metrics.map((m) => m.value).sort((a, b) => a - b);

  if (values.length === 0) {
    return { p50: 0, p90: 0, p95: 0, p99: 0 };
  }

  return {
    p50: values[Math.floor(values.length * 0.5)] || 0,
    p90: values[Math.floor(values.length * 0.9)] || 0,
    p95: values[Math.floor(values.length * 0.95)] || 0,
    p99: values[Math.floor(values.length * 0.99)] || 0,
  };
}

/**
 * Get time series data
 */
export async function getTimeSeries(
  name: string,
  buckets: number = 12,
  timeWindow: number = 3600
): Promise<{ timestamp: Date; value: number }[]> {
  const bucketSize = timeWindow / buckets;
  const result: { timestamp: Date; value: number }[] = [];

  for (let i = buckets - 1; i >= 0; i--) {
    const start = new Date(Date.now() - (i + 1) * bucketSize * 1000);
    const end = new Date(Date.now() - i * bucketSize * 1000);

    const agg = await prisma.metric.aggregate({
      where: {
        name,
        timestamp: { gte: start, lt: end },
      },
      _avg: { value: true },
    });

    result.push({
      timestamp: end,
      value: agg._avg.value || 0,
    });
  }

  return result;
}

/**
 * Export Prometheus format
 */
export async function exportPrometheus(): Promise<string> {
  const metrics = await prisma.metric.findMany({
    orderBy: { timestamp: "desc" },
    take: 1000,
  });

  const lines: string[] = [];

  for (const metric of metrics) {
    const labels = Object.entries(metric.labels as Record<string, string>)
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");

    const labelStr = labels ? `{${labels}}` : "";
    lines.push(`${metric.name}${labelStr} ${metric.value} ${metric.timestamp.getTime()}`);
  }

  return lines.join("\n");
}
