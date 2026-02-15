// src/app/(app)/claims/[claimId]/_components/MetricPill.tsx

interface MetricPillProps {
  label: string;
  value: number | string;
  className?: string;
}

export default function MetricPill({ label, value, className = "" }: MetricPillProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 text-card-foreground ${className}`}
    >
      <div className="mb-1 text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
