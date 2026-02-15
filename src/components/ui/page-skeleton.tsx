/**
 * PageSkeleton — Shared loading skeleton for page transitions.
 * Uses CSS vars for theme-aware colors. Drop into any loading.tsx.
 *
 * Variants:
 *   "dashboard" — stat cards + content sections
 *   "detail"    — hero header + card body
 *   "list"      — search bar + list rows
 *   "form"      — heading + form fields
 */

interface PageSkeletonProps {
  variant?: "dashboard" | "detail" | "list" | "form";
}

function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

function StatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50"
        >
          <Bone className="mb-3 h-4 w-24" />
          <Bone className="mb-2 h-8 w-16" />
          <Bone className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

function ListRows({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800/50">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Bone className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-4 w-48" />
            <Bone className="h-3 w-32" />
          </div>
          <Bone className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function FormFields() {
  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Bone className="h-4 w-24" />
          <Bone className="h-10 w-full" />
        </div>
      ))}
      <Bone className="mt-4 h-10 w-32" />
    </div>
  );
}

export default function PageSkeleton({ variant = "dashboard" }: PageSkeletonProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Bone className="h-8 w-48" />
          <Bone className="h-4 w-64" />
        </div>
        <Bone className="h-10 w-32 rounded-lg" />
      </div>

      {variant === "dashboard" && (
        <>
          <StatCards />
          <div className="space-y-4">
            <Bone className="h-6 w-40" />
            <Bone className="h-48 w-full rounded-xl" />
          </div>
          <ListRows count={3} />
        </>
      )}

      {variant === "detail" && (
        <>
          <Bone className="h-48 w-full rounded-2xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Bone className="h-64 w-full rounded-xl" />
            </div>
            <div className="space-y-4">
              <Bone className="h-40 w-full rounded-xl" />
              <Bone className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </>
      )}

      {variant === "list" && (
        <>
          <Bone className="h-10 w-full max-w-sm rounded-lg" />
          <ListRows count={6} />
        </>
      )}

      {variant === "form" && <FormFields />}
    </div>
  );
}

export { Bone, FormFields, ListRows, StatCards };
