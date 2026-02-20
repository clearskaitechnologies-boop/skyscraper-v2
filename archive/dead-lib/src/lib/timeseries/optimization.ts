/**
 * Task 196: Time-Series Database Optimization
 *
 * Optimized storage and querying for time-series data.
 * Implements downsampling, retention policies, and efficient aggregations.
 */

import prisma from "@/lib/prisma";

export type AggregationType = "avg" | "sum" | "min" | "max" | "count" | "first" | "last";
export type ResolutionLevel = "raw" | "minute" | "hour" | "day" | "week" | "month";

export interface TimeSeriesPoint {
  id: string;
  metric: string;
  timestamp: Date;
  value: number;
  tags: Record<string, string>;
  resolution: ResolutionLevel;
}

export interface TimeSeriesQuery {
  metric: string;
  start: Date;
  end: Date;
  tags?: Record<string, string>;
  aggregation?: AggregationType;
  groupBy?: string[];
  resolution?: ResolutionLevel;
}

export interface TimeSeriesResult {
  metric: string;
  points: Array<{
    timestamp: Date;
    value: number;
    tags?: Record<string, string>;
  }>;
}

export interface RetentionPolicy {
  id: string;
  metric: string;
  resolution: ResolutionLevel;
  retentionDays: number;
  aggregation: AggregationType;
  enabled: boolean;
}

/**
 * Write time-series data point
 */
export async function writePoint(
  metric: string,
  value: number,
  tags: Record<string, string> = {},
  timestamp: Date = new Date()
): Promise<TimeSeriesPoint> {
  const point = await prisma.timeSeriesPoint.create({
    data: {
      metric,
      timestamp,
      value,
      tags,
      resolution: "raw",
    },
  });

  return point as TimeSeriesPoint;
}

/**
 * Write multiple time-series points (batch)
 */
export async function writeBatch(
  points: Array<{
    metric: string;
    value: number;
    tags?: Record<string, string>;
    timestamp?: Date;
  }>
): Promise<number> {
  const data = points.map((p) => ({
    metric: p.metric,
    timestamp: p.timestamp || new Date(),
    value: p.value,
    tags: p.tags || {},
    resolution: "raw" as ResolutionLevel,
  }));

  const result = await prisma.timeSeriesPoint.createMany({
    data,
  });

  return result.count;
}

/**
 * Query time-series data
 */
export async function query(params: TimeSeriesQuery): Promise<TimeSeriesResult> {
  const where: any = {
    metric: params.metric,
    timestamp: {
      gte: params.start,
      lte: params.end,
    },
  };

  // Filter by resolution if specified
  if (params.resolution) {
    where.resolution = params.resolution;
  } else {
    // Auto-select best resolution based on time range
    where.resolution = selectResolution(params.start, params.end);
  }

  // Filter by tags
  if (params.tags) {
    // In production, use proper JSON querying
    // For now, fetch and filter client-side
  }

  const points = await prisma.timeSeriesPoint.findMany({
    where,
    orderBy: { timestamp: "asc" },
  });

  let filteredPoints = points as TimeSeriesPoint[];

  // Client-side tag filtering
  if (params.tags) {
    filteredPoints = filteredPoints.filter((p) => {
      return Object.entries(params.tags!).every(([key, value]) => {
        return p.tags[key] === value;
      });
    });
  }

  // Apply aggregation if specified
  if (params.aggregation) {
    filteredPoints = aggregatePoints(filteredPoints, params.aggregation, params.groupBy);
  }

  return {
    metric: params.metric,
    points: filteredPoints.map((p) => ({
      timestamp: p.timestamp,
      value: p.value,
      tags: p.tags,
    })),
  };
}

/**
 * Select optimal resolution based on time range
 */
function selectResolution(start: Date, end: Date): ResolutionLevel {
  const rangeMs = end.getTime() - start.getTime();
  const hours = rangeMs / (1000 * 60 * 60);

  if (hours <= 6) return "raw";
  if (hours <= 48) return "minute";
  if (hours <= 168) return "hour"; // 1 week
  if (hours <= 720) return "day"; // 30 days
  if (hours <= 4320) return "week"; // 6 months
  return "month";
}

/**
 * Aggregate time-series points
 */
function aggregatePoints(
  points: TimeSeriesPoint[],
  aggregation: AggregationType,
  groupBy?: string[]
): TimeSeriesPoint[] {
  if (!groupBy || groupBy.length === 0) {
    // Single aggregated value
    const value = calculateAggregate(
      points.map((p) => p.value),
      aggregation
    );
    return [
      {
        ...points[0],
        value,
        timestamp: points[0]?.timestamp || new Date(),
      },
    ];
  }

  // Group by tags
  const groups = new Map<string, TimeSeriesPoint[]>();

  points.forEach((point) => {
    const groupKey = groupBy.map((tag) => point.tags[tag] || "").join(":");
    const group = groups.get(groupKey) || [];
    group.push(point);
    groups.set(groupKey, group);
  });

  const result: TimeSeriesPoint[] = [];

  groups.forEach((groupPoints, groupKey) => {
    const value = calculateAggregate(
      groupPoints.map((p) => p.value),
      aggregation
    );
    result.push({
      ...groupPoints[0],
      value,
    });
  });

  return result;
}

/**
 * Calculate aggregate value
 */
function calculateAggregate(values: number[], aggregation: AggregationType): number {
  if (values.length === 0) return 0;

  switch (aggregation) {
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    case "count":
      return values.length;
    case "first":
      return values[0];
    case "last":
      return values[values.length - 1];
    default:
      return 0;
  }
}

/**
 * Downsample raw data to lower resolution
 */
export async function downsample(
  metric: string,
  fromResolution: ResolutionLevel,
  toResolution: ResolutionLevel,
  aggregation: AggregationType,
  timeRange: { start: Date; end: Date }
): Promise<number> {
  const points = await prisma.timeSeriesPoint.findMany({
    where: {
      metric,
      resolution: fromResolution,
      timestamp: {
        gte: timeRange.start,
        lte: timeRange.end,
      },
    },
    orderBy: { timestamp: "asc" },
  });

  if (points.length === 0) return 0;

  // Group points by time bucket
  const buckets = groupByTimeBucket(points as TimeSeriesPoint[], toResolution);

  // Create downsampled points
  const downsampledData = [];

  for (const [bucketTime, bucketPoints] of buckets) {
    const value = calculateAggregate(
      bucketPoints.map((p) => p.value),
      aggregation
    );

    // Merge tags (use first point's tags)
    const tags = bucketPoints[0].tags;

    downsampledData.push({
      metric,
      timestamp: new Date(bucketTime),
      value,
      tags,
      resolution: toResolution,
    });
  }

  const result = await prisma.timeSeriesPoint.createMany({
    data: downsampledData,
  });

  return result.count;
}

/**
 * Group points by time bucket
 */
function groupByTimeBucket(
  points: TimeSeriesPoint[],
  resolution: ResolutionLevel
): Map<number, TimeSeriesPoint[]> {
  const buckets = new Map<number, TimeSeriesPoint[]>();

  points.forEach((point) => {
    const bucketTime = getBucketTime(point.timestamp, resolution);
    const bucket = buckets.get(bucketTime) || [];
    bucket.push(point);
    buckets.set(bucketTime, bucket);
  });

  return buckets;
}

/**
 * Get bucket timestamp for resolution
 */
function getBucketTime(timestamp: Date, resolution: ResolutionLevel): number {
  const date = new Date(timestamp);

  switch (resolution) {
    case "minute":
      date.setSeconds(0, 0);
      break;
    case "hour":
      date.setMinutes(0, 0, 0);
      break;
    case "day":
      date.setHours(0, 0, 0, 0);
      break;
    case "week":
      date.setHours(0, 0, 0, 0);
      const day = date.getDay();
      date.setDate(date.getDate() - day);
      break;
    case "month":
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      break;
    default:
      break;
  }

  return date.getTime();
}

/**
 * Create retention policy
 */
export async function createRetentionPolicy(
  metric: string,
  resolution: ResolutionLevel,
  retentionDays: number,
  aggregation: AggregationType
): Promise<RetentionPolicy> {
  const policy = await prisma.retentionPolicy.create({
    data: {
      metric,
      resolution,
      retentionDays,
      aggregation,
      enabled: true,
    },
  });

  return policy as RetentionPolicy;
}

/**
 * Apply retention policies (delete old data)
 */
export async function applyRetentionPolicies(): Promise<{
  deletedCount: number;
  policiesApplied: number;
}> {
  const policies = await prisma.retentionPolicy.findMany({
    where: { enabled: true },
  });

  let totalDeleted = 0;

  for (const policy of policies) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    const result = await prisma.timeSeriesPoint.deleteMany({
      where: {
        metric: policy.metric,
        resolution: policy.resolution,
        timestamp: { lt: cutoffDate },
      },
    });

    totalDeleted += result.count;
  }

  return {
    deletedCount: totalDeleted,
    policiesApplied: policies.length,
  };
}

/**
 * Get metrics list
 */
export async function getMetrics(): Promise<string[]> {
  const result = await prisma.timeSeriesPoint.findMany({
    select: { metric: true },
    distinct: ["metric"],
  });

  return result.map((r) => r.metric);
}

/**
 * Get metric statistics
 */
export async function getMetricStats(
  metric: string,
  timeRange: { start: Date; end: Date }
): Promise<{
  count: number;
  min: number;
  max: number;
  avg: number;
  sum: number;
}> {
  const points = await prisma.timeSeriesPoint.findMany({
    where: {
      metric,
      timestamp: {
        gte: timeRange.start,
        lte: timeRange.end,
      },
    },
    select: { value: true },
  });

  if (points.length === 0) {
    return { count: 0, min: 0, max: 0, avg: 0, sum: 0 };
  }

  const values = points.map((p) => p.value);

  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    sum: values.reduce((a, b) => a + b, 0),
  };
}

/**
 * Delete metric data
 */
export async function deleteMetric(
  metric: string,
  timeRange?: { start: Date; end: Date }
): Promise<number> {
  const where: any = { metric };

  if (timeRange) {
    where.timestamp = {
      gte: timeRange.start,
      lte: timeRange.end,
    };
  }

  const result = await prisma.timeSeriesPoint.deleteMany({ where });
  return result.count;
}
