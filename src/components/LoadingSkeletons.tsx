interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export function LoadingSkeleton({
  className = "",
  lines = 1,
  height = "h-4",
}: LoadingSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`animate-pulse ${height} w-full rounded bg-neutral-100`} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="mb-4 h-6 w-3/4 rounded bg-neutral-100" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-neutral-100" />
        <div className="h-4 w-5/6 rounded bg-neutral-100" />
        <div className="h-4 w-4/6 rounded bg-neutral-100" />
      </div>
    </div>
  );
}

export function ImageSkeleton() {
  return (
    <div className="flex aspect-video animate-pulse items-center justify-center rounded-lg bg-neutral-100">
      <svg className="h-12 w-12 text-neutral-300" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
