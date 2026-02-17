import { describe, expect, it, vi } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

import { buildClaimTimeline, calculateVelocitySnapshot } from "@/lib/analytics/claim-velocity";

// ── Test data helpers ──

function makeDate(daysAgo: number): Date {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
}

function makeClaim(overrides: Partial<Parameters<typeof calculateVelocitySnapshot>[0][0]> = {}) {
  return {
    id: "claim-1",
    claimNumber: "CLM-001",
    carrier: "State Farm",
    status: "CLOSED",
    createdAt: makeDate(45),
    closedAt: makeDate(5),
    totalValue: 12000,
    stages: [
      { stage: "INTAKE", enteredAt: makeDate(45), exitedAt: makeDate(43) },
      { stage: "INSPECTION", enteredAt: makeDate(43), exitedAt: makeDate(40) },
      { stage: "ESTIMATE", enteredAt: makeDate(40), exitedAt: makeDate(38) },
      { stage: "SUPPLEMENT_PENDING", enteredAt: makeDate(38), exitedAt: makeDate(20) },
      { stage: "APPROVED", enteredAt: makeDate(20), exitedAt: makeDate(10) },
      { stage: "CLOSED", enteredAt: makeDate(10), exitedAt: makeDate(5) },
    ],
    supplements: [
      {
        submittedAt: makeDate(38),
        respondedAt: makeDate(20),
        status: "APPROVED",
        amount: 4200,
      },
    ],
    ...overrides,
  };
}

describe("Claim Velocity Analytics Engine", () => {
  describe("calculateVelocitySnapshot", () => {
    it("calculates average claim velocity for closed claims", () => {
      const claims = [
        makeClaim({ createdAt: makeDate(40), closedAt: makeDate(10) }), // 30 days
        makeClaim({
          id: "claim-2",
          claimNumber: "CLM-002",
          createdAt: makeDate(50),
          closedAt: makeDate(30),
        }), // 20 days
      ];

      const snapshot = calculateVelocitySnapshot(claims, 90);

      expect(snapshot.avgClaimVelocityDays).toBeGreaterThan(0);
      expect(snapshot.medianClaimVelocityDays).toBeGreaterThan(0);
    });

    it("calculates supplement response times", () => {
      const claims = [
        makeClaim({
          supplements: [
            {
              submittedAt: makeDate(30),
              respondedAt: makeDate(20),
              status: "APPROVED",
              amount: 3000,
            },
          ],
        }),
      ];

      const snapshot = calculateVelocitySnapshot(claims, 90);
      expect(snapshot.avgSupplementResponseDays).toBeCloseTo(10, 0);
    });

    it("calculates revenue per day", () => {
      const claims = [
        makeClaim({ totalValue: 9000 }),
        makeClaim({
          id: "claim-2",
          claimNumber: "CLM-002",
          totalValue: 15000,
          closedAt: makeDate(2),
        }),
      ];

      const snapshot = calculateVelocitySnapshot(claims, 90);
      expect(snapshot.revenuePerDay).toBeGreaterThan(0);
    });

    it("groups carrier benchmarks correctly", () => {
      const claims = [
        makeClaim({ carrier: "State Farm" }),
        makeClaim({
          id: "claim-2",
          claimNumber: "CLM-002",
          carrier: "Allstate",
          createdAt: makeDate(60),
          closedAt: makeDate(10),
        }),
        makeClaim({
          id: "claim-3",
          claimNumber: "CLM-003",
          carrier: "State Farm",
          createdAt: makeDate(30),
          closedAt: makeDate(5),
        }),
      ];

      const snapshot = calculateVelocitySnapshot(claims, 90);

      expect(snapshot.carrierBenchmarks.length).toBeGreaterThanOrEqual(2);
      const sf = snapshot.carrierBenchmarks.find((b) => b.carrier === "State Farm");
      expect(sf).toBeDefined();
      expect(sf!.claimCount).toBe(2);
    });

    it("detects bottleneck stages", () => {
      const claims = [makeClaim()];
      const snapshot = calculateVelocitySnapshot(claims, 90);

      expect(snapshot.bottlenecks.length).toBeGreaterThan(0);
      // SUPPLEMENT_PENDING (18 days) should be the biggest bottleneck
      expect(snapshot.bottlenecks[0].stage).toBe("SUPPLEMENT_PENDING");
      expect(snapshot.bottlenecks[0].suggestion).toBeTruthy();
    });

    it("calculates trend direction", () => {
      const claims = [makeClaim()];
      const snapshot = calculateVelocitySnapshot(claims, 90);

      expect(snapshot.trend).toBeDefined();
      expect(["faster", "slower", "stable"]).toContain(snapshot.trend.direction);
    });

    it("handles empty claims array gracefully", () => {
      const snapshot = calculateVelocitySnapshot([], 90);

      expect(snapshot.avgClaimVelocityDays).toBe(0);
      expect(snapshot.medianClaimVelocityDays).toBe(0);
      expect(snapshot.avgSupplementResponseDays).toBe(0);
      expect(snapshot.revenuePerDay).toBe(0);
      expect(snapshot.carrierBenchmarks).toEqual([]);
      expect(snapshot.bottlenecks).toEqual([]);
      expect(snapshot.trend.direction).toBe("stable");
    });
  });

  describe("buildClaimTimeline", () => {
    it("builds a timeline with stage durations", () => {
      const claim = makeClaim();
      const timeline = buildClaimTimeline(claim);

      expect(timeline.claimId).toBe("claim-1");
      expect(timeline.claimNumber).toBe("CLM-001");
      expect(timeline.carrier).toBe("State Farm");
      expect(timeline.stages.length).toBe(6);
      expect(timeline.totalDays).toBeGreaterThan(0);
    });

    it("handles in-progress stages without exitedAt", () => {
      const claim = {
        id: "claim-open",
        claimNumber: "CLM-OPEN",
        carrier: "USAA",
        status: "IN_PROGRESS",
        createdAt: makeDate(20),
        closedAt: null,
        stages: [
          { stage: "INTAKE", enteredAt: makeDate(20), exitedAt: makeDate(18) },
          { stage: "INSPECTION", enteredAt: makeDate(18), exitedAt: null }, // still in progress
        ],
      };

      const timeline = buildClaimTimeline(claim);

      expect(timeline.stages[1].exitedAt).toBeNull();
      expect(timeline.stages[1].durationDays).toBeGreaterThan(0);
      expect(timeline.totalDays).toBeGreaterThan(0);
    });

    it("calculates correct total days for closed claims", () => {
      const claim = makeClaim({
        createdAt: makeDate(30),
        closedAt: makeDate(0),
      });

      const timeline = buildClaimTimeline(claim);
      expect(timeline.totalDays).toBeCloseTo(30, 0);
    });
  });
});
