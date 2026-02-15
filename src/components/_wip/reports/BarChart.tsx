"use client";

interface BarChartProps {
  data: Record<string, number>;
  title: string;
  colors?: Record<string, string>;
}

const defaultColors: Record<string, string> = {
  FILED: "#3b82f6", // blue
  ADJUSTER_REVIEW: "#8b5cf6", // purple
  APPROVED: "#10b981", // green
  DENIED: "#ef4444", // red
  APPEAL: "#f59e0b", // amber
  BUILD: "#6366f1", // indigo
  COMPLETED: "#14b8a6", // teal
  DEPRECIATION: "#f97316", // orange
  UNASSIGNED: "#6b7280", // gray
};

export default function BarChart({ data, title, colors = defaultColors }: BarChartProps) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxValue = Math.max(...entries.map((e) => e[1]), 1);

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
        <h3 className="mb-4 text-lg font-semibold text-[color:var(--text)]">{title}</h3>
        <p className="py-8 text-center text-[color:var(--muted)]">No data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
      <h3 className="mb-6 text-lg font-semibold text-[color:var(--text)]">{title}</h3>
      <div className="space-y-4">
        {entries.map(([label, value]) => {
          const percentage = (value / maxValue) * 100;
          const color = colors[label] || colors.UNASSIGNED || "#6b7280";

          return (
            <div key={label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[color:var(--text)]">
                  {label.replace(/_/g, " ")}
                </span>
                <span className="text-sm font-bold text-[color:var(--text)]">{value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
