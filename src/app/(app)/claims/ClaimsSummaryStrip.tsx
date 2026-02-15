"use client";

/**
 * PHASE C: At-a-Glance Summary Strip
 * Real-time dashboard metrics for claim intelligence
 */

import { useMemo } from "react";

import { claimNeedsAttention } from "@/lib/claims/status";

type ClaimForSummary = {
  id: string;
  status: string;
  contactId: string | null;
  dateOfLoss: string | Date;
  updatedAt: string | Date;
};

type Props = {
  claims: ClaimForSummary[];
};

export function ClaimsSummaryStrip({ claims }: Props) {
  const metrics = useMemo(() => {
    let needsAttention = 0;
    let missingContact = 0;
    let intakeOnly = 0;

    claims.forEach((claim) => {
      // Convert string dates to Date objects for claimNeedsAttention
      const claimData = {
        status: claim.status,
        contactId: claim.contactId,
        dateOfLoss:
          typeof claim.dateOfLoss === "string" ? new Date(claim.dateOfLoss) : claim.dateOfLoss,
        updatedAt:
          typeof claim.updatedAt === "string" ? new Date(claim.updatedAt) : claim.updatedAt,
      };

      if (claimNeedsAttention(claimData)) {
        needsAttention++;
      }

      if (!claim.contactId) {
        missingContact++;
      }

      if (claim.status === "INTAKE") {
        intakeOnly++;
      }
    });

    return {
      total: claims.length,
      needsAttention,
      missingContact,
      intakeOnly,
    };
  }, [claims]);

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Claims */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:from-blue-950/30 dark:to-cyan-950/30">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Total Claims
        </div>
        <div className="text-3xl font-bold text-foreground">{metrics.total}</div>
        <div className="mt-1 text-xs text-muted-foreground">Active in workspace</div>
      </div>

      {/* Claims Needing Attention */}
      <div
        className={`rounded-xl border p-4 ${
          metrics.needsAttention > 0
            ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/30"
            : "border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/30 dark:to-slate-900/30"
        }`}
      >
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Needs Attention
        </div>
        <div
          className={`text-3xl font-bold ${metrics.needsAttention > 0 ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}
        >
          {metrics.needsAttention}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {metrics.needsAttention > 0 ? "Stalled or missing info" : "All claims on track"}
        </div>
      </div>

      {/* Missing Contact */}
      <div
        className={`rounded-xl border p-4 ${
          metrics.missingContact > 0
            ? "border-red-200 bg-gradient-to-br from-red-50 to-pink-50 dark:border-red-900/50 dark:from-red-950/30 dark:to-pink-950/30"
            : "border-border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/30 dark:to-slate-900/30"
        }`}
      >
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Missing Contact
        </div>
        <div
          className={`text-3xl font-bold ${metrics.missingContact > 0 ? "text-red-700 dark:text-red-400" : "text-foreground"}`}
        >
          {metrics.missingContact}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {metrics.missingContact > 0 ? "No contact assigned" : "All linked"}
        </div>
      </div>

      {/* Intake Only */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-sky-50 to-blue-50 p-4 dark:from-sky-950/30 dark:to-blue-950/30">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Intake Stage
        </div>
        <div className="text-3xl font-bold text-foreground">{metrics.intakeOnly}</div>
        <div className="mt-1 text-xs text-muted-foreground">Waiting to schedule</div>
      </div>
    </div>
  );
}
