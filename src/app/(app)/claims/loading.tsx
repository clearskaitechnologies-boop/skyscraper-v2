export default function ClaimsLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="h-10 w-48 animate-pulse rounded-xl bg-[var(--surface-2)]" />

        {/* Filters */}
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 animate-pulse rounded-xl bg-[var(--surface-2)]"
            />
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-[var(--surface-2)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
