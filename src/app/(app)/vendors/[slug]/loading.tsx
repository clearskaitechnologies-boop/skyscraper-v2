/**
 * Skeleton loading state for vendor detail page.
 * Shows proper placeholder layout while data loads.
 */
export default function VendorDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero skeleton */}
      <div className="relative h-48 animate-pulse bg-gradient-to-r from-blue-600/20 to-indigo-600/20">
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end gap-4">
            <div className="h-24 w-24 rounded-xl bg-white/30 dark:bg-slate-800/50" />
            <div className="space-y-2 pb-2">
              <div className="h-7 w-48 rounded bg-white/30 dark:bg-slate-700" />
              <div className="h-4 w-32 rounded bg-white/20 dark:bg-slate-700/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
              <div className="mb-2 h-3 w-20 rounded bg-muted" />
              <div className="h-6 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main content */}
          <div className="space-y-4 md:col-span-2">
            <div className="animate-pulse rounded-lg border bg-card p-6">
              <div className="mb-4 h-5 w-32 rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-4 w-5/6 rounded bg-muted" />
              </div>
            </div>
            <div className="animate-pulse rounded-lg border bg-card p-6">
              <div className="mb-4 h-5 w-28 rounded bg-muted" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 rounded bg-muted" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="animate-pulse rounded-lg border bg-card p-6">
              <div className="mb-4 h-5 w-24 rounded bg-muted" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
