import { MetricCard } from "./MetricCard";

export default function StatGrid({
  stats,
}: {
  stats: Array<{ title: string; value: string; sub?: string }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s, i) => (
        <MetricCard
          key={s.title}
          label={s.title}
          value={s.value}
          description={s.sub}
          delay={i * 0.06}
        />
      ))}
    </div>
  );
}
