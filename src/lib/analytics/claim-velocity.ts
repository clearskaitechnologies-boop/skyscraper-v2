/**
 * Claim Velocity Analytics Engine
 *
 * Measures and analyzes the speed at which claims move through
 * each stage of the restoration workflow. Provides:
 *
 *  - Stage-level timing (intake → inspection → supplement → approval → payment)
 *  - Carrier benchmarking (which carriers pay fastest / slowest)
 *  - Revenue velocity (dollars per day throughput)
 *  - Bottleneck detection (where claims stall)
 *  - Trend analysis (are we getting faster or slower?)
 */

import "server-only";

// ── Types ──

export interface ClaimTimeline {
  claimId: string;
  claimNumber: string;
  carrier: string | null;
  stages: StageMetric[];
  totalDays: number;
  status: string;
}

export interface StageMetric {
  stage: string;
  enteredAt: Date;
  exitedAt: Date | null;
  durationDays: number;
}

export interface VelocitySnapshot {
  /** Average days from intake to close (last 90 days) */
  avgClaimVelocityDays: number;
  /** Median days from intake to close */
  medianClaimVelocityDays: number;
  /** Average days from supplement submit to carrier approval */
  avgSupplementResponseDays: number;
  /** Revenue throughput: total closed revenue / days in period */
  revenuePerDay: number;
  /** Carrier performance ranking */
  carrierBenchmarks: CarrierBenchmark[];
  /** Stage bottleneck analysis */
  bottlenecks: Bottleneck[];
  /** Period comparison (current vs previous) */
  trend: TrendComparison;
}

export interface CarrierBenchmark {
  carrier: string;
  avgDaysToClose: number;
  avgSupplementResponseDays: number;
  claimCount: number;
  approvalRate: number;
}

export interface Bottleneck {
  stage: string;
  avgDays: number;
  percentOfTotal: number;
  suggestion: string;
}

export interface TrendComparison {
  currentPeriodAvgDays: number;
  previousPeriodAvgDays: number;
  changePercent: number;
  direction: "faster" | "slower" | "stable";
}

// ── Constants ──

const CLAIM_STAGES = [
  "INTAKE",
  "INSPECTION",
  "ESTIMATE",
  "SUPPLEMENT_PENDING",
  "SUPPLEMENT_REVIEW",
  "APPROVED",
  "MATERIAL_ORDER",
  "IN_PROGRESS",
  "FINAL_INSPECTION",
  "INVOICED",
  "PAID",
  "CLOSED",
] as const;

const STAGE_BOTTLENECK_SUGGESTIONS: Record<string, string> = {
  INTAKE: "Automate lead-to-claim conversion with intake forms",
  INSPECTION: "Schedule inspections within 48 hours of intake",
  ESTIMATE: "Use AI damage report builder to generate estimates faster",
  SUPPLEMENT_PENDING: "Submit supplements within 3 days of initial estimate",
  SUPPLEMENT_REVIEW: "Follow up with carrier adjusters every 5 business days",
  APPROVED: "Pre-order materials before approval to reduce lead time",
  MATERIAL_ORDER: "Route orders to ABC Supply immediately upon approval",
  IN_PROGRESS: "Use crew manager to assign and track work daily",
  FINAL_INSPECTION: "Schedule final walkthrough before job completion",
  INVOICED: "Auto-generate invoices upon completion via QuickBooks sync",
  PAID: "Track mortgage checks and supplement payments separately",
};

// ── Core Engine ──

/**
 * Calculate velocity metrics for a set of claims with their stage history.
 */
export function calculateVelocitySnapshot(
  claims: Array<{
    id: string;
    claimNumber: string;
    carrier: string | null;
    status: string;
    createdAt: Date;
    closedAt: Date | null;
    totalValue: number;
    stages: Array<{
      stage: string;
      enteredAt: Date;
      exitedAt: Date | null;
    }>;
    supplements: Array<{
      submittedAt: Date | null;
      respondedAt: Date | null;
      status: string;
      amount: number;
    }>;
  }>,
  periodDays: number = 90
): VelocitySnapshot {
  const now = Date.now();
  const periodStart = now - periodDays * 24 * 60 * 60 * 1000;
  const previousPeriodStart = periodStart - periodDays * 24 * 60 * 60 * 1000;

  // ── Filter closed claims in current period ──
  const currentPeriodClosed = claims.filter(
    (c) => c.closedAt && c.closedAt.getTime() >= periodStart
  );
  const previousPeriodClosed = claims.filter(
    (c) =>
      c.closedAt &&
      c.closedAt.getTime() >= previousPeriodStart &&
      c.closedAt.getTime() < periodStart
  );

  // ── Claim velocity ──
  const currentDays = currentPeriodClosed.map((c) => daysBetween(c.createdAt, c.closedAt!));
  const previousDays = previousPeriodClosed.map((c) => daysBetween(c.createdAt, c.closedAt!));

  const avgClaimVelocityDays = average(currentDays);
  const medianClaimVelocityDays = median(currentDays);

  // ── Supplement response time ──
  const supplementResponses = claims
    .flatMap((c) => c.supplements)
    .filter((s) => s.submittedAt && s.respondedAt)
    .map((s) => daysBetween(s.submittedAt!, s.respondedAt!));

  const avgSupplementResponseDays = average(supplementResponses);

  // ── Revenue velocity ──
  const totalClosedRevenue = currentPeriodClosed.reduce((sum, c) => sum + (c.totalValue || 0), 0);
  const revenuePerDay = periodDays > 0 ? totalClosedRevenue / periodDays : 0;

  // ── Carrier benchmarks ──
  const carrierBenchmarks = calculateCarrierBenchmarks(claims);

  // ── Bottleneck analysis ──
  const bottlenecks = calculateBottlenecks(claims);

  // ── Trend ──
  const currentAvg = average(currentDays);
  const previousAvg = average(previousDays);
  const changePercent = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

  const trend: TrendComparison = {
    currentPeriodAvgDays: currentAvg,
    previousPeriodAvgDays: previousAvg,
    changePercent: Math.round(changePercent * 10) / 10,
    direction: Math.abs(changePercent) < 5 ? "stable" : changePercent < 0 ? "faster" : "slower",
  };

  return {
    avgClaimVelocityDays: Math.round(avgClaimVelocityDays * 10) / 10,
    medianClaimVelocityDays: Math.round(medianClaimVelocityDays * 10) / 10,
    avgSupplementResponseDays: Math.round(avgSupplementResponseDays * 10) / 10,
    revenuePerDay: Math.round(revenuePerDay),
    carrierBenchmarks,
    bottlenecks,
    trend,
  };
}

/**
 * Build a timeline for a single claim showing time spent in each stage.
 */
export function buildClaimTimeline(claim: {
  id: string;
  claimNumber: string;
  carrier: string | null;
  status: string;
  createdAt: Date;
  closedAt: Date | null;
  stages: Array<{
    stage: string;
    enteredAt: Date;
    exitedAt: Date | null;
  }>;
}): ClaimTimeline {
  const stages: StageMetric[] = claim.stages.map((s) => ({
    stage: s.stage,
    enteredAt: s.enteredAt,
    exitedAt: s.exitedAt,
    durationDays: s.exitedAt
      ? daysBetween(s.enteredAt, s.exitedAt)
      : daysBetween(s.enteredAt, new Date()),
  }));

  const totalDays = claim.closedAt
    ? daysBetween(claim.createdAt, claim.closedAt)
    : daysBetween(claim.createdAt, new Date());

  return {
    claimId: claim.id,
    claimNumber: claim.claimNumber,
    carrier: claim.carrier,
    stages,
    totalDays: Math.round(totalDays * 10) / 10,
    status: claim.status,
  };
}

// ── Internal Helpers ──

function calculateCarrierBenchmarks(
  claims: Array<{
    carrier: string | null;
    createdAt: Date;
    closedAt: Date | null;
    supplements: Array<{
      submittedAt: Date | null;
      respondedAt: Date | null;
      status: string;
    }>;
  }>
): CarrierBenchmark[] {
  const grouped = new Map<
    string,
    { daysToClose: number[]; supplementDays: number[]; approved: number; total: number }
  >();

  for (const c of claims) {
    const carrier = c.carrier || "Unknown";
    if (!grouped.has(carrier)) {
      grouped.set(carrier, { daysToClose: [], supplementDays: [], approved: 0, total: 0 });
    }
    const group = grouped.get(carrier)!;

    if (c.closedAt) {
      group.daysToClose.push(daysBetween(c.createdAt, c.closedAt));
    }

    for (const s of c.supplements) {
      group.total++;
      if (s.status === "APPROVED" || s.status === "PAID") group.approved++;
      if (s.submittedAt && s.respondedAt) {
        group.supplementDays.push(daysBetween(s.submittedAt, s.respondedAt));
      }
    }
  }

  return Array.from(grouped.entries())
    .map(([carrier, data]) => ({
      carrier,
      avgDaysToClose: Math.round(average(data.daysToClose) * 10) / 10,
      avgSupplementResponseDays: Math.round(average(data.supplementDays) * 10) / 10,
      claimCount: data.daysToClose.length,
      approvalRate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.claimCount - a.claimCount);
}

function calculateBottlenecks(
  claims: Array<{
    stages: Array<{
      stage: string;
      enteredAt: Date;
      exitedAt: Date | null;
    }>;
  }>
): Bottleneck[] {
  const stageDurations = new Map<string, number[]>();

  for (const c of claims) {
    for (const s of c.stages) {
      if (!stageDurations.has(s.stage)) {
        stageDurations.set(s.stage, []);
      }
      const duration = s.exitedAt
        ? daysBetween(s.enteredAt, s.exitedAt)
        : daysBetween(s.enteredAt, new Date());
      stageDurations.get(s.stage)!.push(duration);
    }
  }

  const stageAvgs = Array.from(stageDurations.entries()).map(([stage, durations]) => ({
    stage,
    avgDays: average(durations),
  }));

  const totalAvg = stageAvgs.reduce((sum, s) => sum + s.avgDays, 0);

  return stageAvgs
    .map((s) => ({
      stage: s.stage,
      avgDays: Math.round(s.avgDays * 10) / 10,
      percentOfTotal: totalAvg > 0 ? Math.round((s.avgDays / totalAvg) * 100) : 0,
      suggestion:
        STAGE_BOTTLENECK_SUGGESTIONS[s.stage] || "Review workflow for optimization opportunities",
    }))
    .sort((a, b) => b.avgDays - a.avgDays);
}

function daysBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
