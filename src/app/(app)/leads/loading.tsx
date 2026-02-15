export default function LeadsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-11 w-36 animate-pulse rounded-lg bg-slate-200" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-[var(--surface-1)] p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="mb-2 h-8 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Activity Section Skeleton */}
      <div className="rounded-xl border bg-[var(--surface-1)] p-6 shadow-sm">
        <div className="mb-4 h-6 w-40 animate-pulse rounded-lg bg-slate-200" />
        <div className="py-12 text-center">
          <div className="mx-auto mb-2 h-12 w-12 animate-pulse rounded-full bg-slate-200" />
          <div className="mx-auto h-4 w-48 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
