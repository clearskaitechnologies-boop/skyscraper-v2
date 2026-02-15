"use client";
import * as Sentry from "@sentry/nextjs";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const pathname = usePathname();
  const errorId = Math.random().toString(36).substr(2, 9);

  // Detect if we're in the client portal
  const isClientPortal = pathname?.startsWith("/portal");
  const dashboardHref = isClientPortal ? "/portal" : "/dashboard";
  const dashboardLabel = isClientPortal ? "Go to Portal" : "Go to Dashboard";

  useEffect(() => {
    if (error) Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-red-600">
          <svg
            className="h-12 w-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-neutral-900">Unexpected Error</h1>
        <p className="mb-6 text-neutral-600">
          The application encountered an error. You can retry the previous action or return to a
          safe page.
        </p>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center rounded-xl bg-[#147BFF] px-6 py-3 font-medium text-white transition-colors hover:bg-[#0366D6]"
          >
            Try Again
          </button>
          <a
            href={dashboardHref}
            className="inline-flex items-center rounded-xl bg-neutral-200 px-6 py-3 font-medium text-neutral-800 transition-colors hover:bg-neutral-300"
          >
            {dashboardLabel}
          </a>
          <button
            onClick={() => setShowDetails((d) => !d)}
            className="text-sm text-neutral-500 hover:text-neutral-700"
            type="button"
          >
            {showDetails ? "Hide technical details" : "Show technical details"}
          </button>
        </div>
        {showDetails && (
          <div className="mt-6 rounded-lg bg-white p-4 text-left shadow">
            <div className="mb-3 space-y-1 text-xs">
              {pathname && (
                <div>
                  <span className="font-semibold">Route:</span>{" "}
                  <span className="font-mono">{pathname}</span>
                </div>
              )}
              <div>
                <span className="font-semibold">Message:</span>{" "}
                <span className="font-mono">{error.message || "Unknown error"}</span>
              </div>
              {error.digest && (
                <div>
                  <span className="font-semibold">Digest:</span>{" "}
                  <span className="font-mono text-[10px]">{error.digest}</span>
                </div>
              )}
              <div>
                <span className="font-semibold">Error ID:</span>{" "}
                <span className="font-mono text-[10px]">{errorId}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
