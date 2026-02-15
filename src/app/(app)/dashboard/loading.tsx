export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-11 w-32 animate-pulse rounded-lg bg-slate-200" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-[var(--surface-1)] p-6 shadow-sm">
            <div className="mb-3 h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mb-2 h-8 w-16 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* AI Tools Section Skeleton */}
      <div className="space-y-4">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
      </div>

      {/* Quick Actions Section Skeleton */}
      <div className="space-y-4">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-[var(--surface-1)] p-6 shadow-sm">
              <div className="mb-2 h-6 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Section Skeleton */}
      <div className="space-y-4">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="divide-y rounded-xl border bg-[var(--surface-1)] shadow-sm">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
