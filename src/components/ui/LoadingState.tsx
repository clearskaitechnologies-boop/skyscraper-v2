import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  variant?: "default" | "inline" | "spinner";
}

export function LoadingState({ message = "Loading...", variant = "default" }: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-slate-200 p-4 dark:border-slate-700"
        >
          <div className="mb-2 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
