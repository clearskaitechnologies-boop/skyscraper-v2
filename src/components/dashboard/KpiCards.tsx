// src/components/dashboard/KpiCards.tsx
"use client";

import React from "react";

type Props = {
  activeLeads: number;
  openClaims: number;
  revenueMtdCents: number;
  conversionRate: number; // 0–1 fraction
};

function formatCurrencyFromCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format((cents || 0) / 100);
}

function formatPercent(value: number) {
  const pct = Math.round((value || 0) * 100);
  return `${pct}%`;
}

export const KpiCards: React.FC<Props> = ({
  activeLeads,
  openClaims,
  revenueMtdCents,
  conversionRate,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard testId="kpi-active-leads" label="Active Leads" value={activeLeads.toString()} badge="+8%" />
      <KpiCard testId="kpi-open-claims" label="Open Claims" value={openClaims.toString()} badge="+2%" />
      <KpiCard testId="kpi-revenue-mtd" label="Revenue MTD" value={formatCurrencyFromCents(revenueMtdCents)} badge="+15%" />
      <KpiCard testId="kpi-conversion-rate" label="Conversion Rate" value={formatPercent(conversionRate)} badge="+5%" />
    </div>
  );
};

type CardProps = {
  label: string;
  value: string;
  badge?: string;
  testId?: string;
};

const KpiCard: React.FC<CardProps> = ({ label, value, badge, testId }) => {
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-2xl border bg-card/80 p-4 shadow-sm" data-testid={testId}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
        {badge && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <span className="break-words text-3xl font-semibold leading-tight md:text-4xl">{value}</span>
      </div>
    </div>
  );
};
