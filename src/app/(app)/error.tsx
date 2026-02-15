"use client";

import * as Sentry from "@sentry/nextjs";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();

  // Report error to Sentry
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        component: "app-error-boundary",
        pathname: pathname || "unknown",
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error, pathname]);

  // Detect if we're in the client portal
  const isClientPortal = pathname?.startsWith("/portal");
  const dashboardHref = isClientPortal ? "/portal" : "/dashboard";
  const dashboardLabel = isClientPortal ? "Back to Portal" : "Back to Dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="max-w-md rounded-lg bg-[var(--surface-1)] p-8 text-center shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-[color:var(--text)]">App Error</h1>
        <p className="mb-6 text-slate-700 dark:text-slate-300">
          Something went wrong in the application. Please try again.
        </p>
        <div className="space-y-3">
          <Button onClick={() => reset()} className="w-full bg-sky-600 hover:bg-sky-700">
            Try again
          </Button>
          <a
            href={dashboardHref}
            className="block w-full rounded-lg bg-[var(--surface-1)] px-4 py-2 text-[color:var(--text)] hover:bg-[var(--surface-2)]"
          >
            {dashboardLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
