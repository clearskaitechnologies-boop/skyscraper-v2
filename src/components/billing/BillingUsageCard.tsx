"use client";
import { format } from "date-fns";

type UsageMetric = {
  label: string;
  used: number;
  limit: number;
};

export type BillingUsageCardProps = {
  planName: "Solo" | "Business" | "Enterprise";
  renewsAt: Date;
  seatsUsed: number;
  seatsLimit: number;
  mockups: UsageMetric;
  quickDOL: UsageMetric;
  weatherReports: UsageMetric;
};

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const ratio = Math.min(1, limit === 0 ? 0 : used / limit);
  const percentBucket = Math.min(100, Math.round((ratio * 100) / 10) * 10);
  const widthClasses: Record<number, string> = {
    0: "w-0",
    10: "w-1/12",
    20: "w-2/12",
    30: "w-3/12",
    40: "w-4/12",
    50: "w-5/12",
    60: "w-6/12",
    70: "w-7/12",
    80: "w-8/12",
    90: "w-9/12",
    100: "w-full",
  };
  const widthClass = widthClasses[percentBucket] || "w-0";
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full bg-sky-500 transition-all ${widthClass}`} />
    </div>
  );
}

export function BillingUsageCard(props: BillingUsageCardProps) {
  const {
    planName,
    renewsAt,
    seatsUsed,
    seatsLimit,
    mockups,
    quickDOL,
    weatherReports,
  } = props;
  const metrics: UsageMetric[] = [mockups, quickDOL, weatherReports];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Plan & usage
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {planName} plan
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Renews on <span className="font-medium">{format(renewsAt, "MMM d, yyyy")}</span>
          </p>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
          {seatsUsed} / {seatsLimit} seats in use
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => {
          const nearLimit = metric.limit > 0 && metric.used / metric.limit >= 0.8;
          const overLimit = metric.limit > 0 && metric.used / metric.limit > 1.01;
          return (
            <div key={metric.label} className="text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-900">{metric.label}</p>
                <p className="text-xs text-slate-600">
                  {metric.used} / {metric.limit}
                </p>
              </div>
              <UsageBar used={metric.used} limit={metric.limit} />
              {nearLimit && !overLimit && (
                <p className="mt-1 text-[11px] text-amber-600">
                  Approaching monthly limit. Consider upgrading.
                </p>
              )}
              {overLimit && (
                <p className="mt-1 text-[11px] text-rose-600">
                  Over monthly limit. Overage billing may apply.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <p>
          Usage resets each billing cycle. Plan changes adjust limits next cycle.
        </p>
        <button className="rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-900 hover:border-slate-400">
          Manage plan
        </button>
      </div>
    </section>
  );
}
