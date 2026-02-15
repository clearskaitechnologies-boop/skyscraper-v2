export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-200" />

      {/* Settings Cards Skeleton */}
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-[var(--surface-1)] p-6 shadow-sm">
            <div className="mb-4 h-6 w-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="space-y-4">
              <div>
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
              </div>
              <div>
                <div className="mb-2 h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
