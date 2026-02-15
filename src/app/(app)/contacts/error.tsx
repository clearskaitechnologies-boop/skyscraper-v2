"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronDown, ChevronUp, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ContactsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    // Log detailed error to console for debugging
    console.error("[ContactsPage Error]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      name: error.name,
    });
  }, [error]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    reset();
  };

  // If we've retried multiple times, suggest going to dashboard instead
  const tooManyRetries = retryCount >= 3;

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4">
      <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
        <AlertTriangle className="h-8 w-8 text-amber-600" />
      </div>

      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        Unable to load contacts
      </h2>

      <p className="max-w-md text-center text-sm text-slate-600 dark:text-slate-400">
        {tooManyRetries
          ? "We're having trouble loading this page. Try visiting another page and coming back."
          : "There was a temporary issue loading your contacts. Please try again."}
      </p>

      <div className="flex gap-3">
        {!tooManyRetries && (
          <Button onClick={handleRetry} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>

      {/* Debug info for development or if user clicks to expand */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
      >
        {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        Technical Details
      </button>

      {showDetails && (
        <div className="mt-2 max-w-lg rounded-lg border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-700 dark:bg-slate-800">
          <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Error:</p>
          <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
            {error.message || "Unknown error"}
          </p>
          {error.digest && <p className="text-xs text-slate-400">Digest: {error.digest}</p>}
          {isDev && error.stack && (
            <pre className="mt-2 max-h-40 overflow-auto text-xs text-red-600 dark:text-red-400">
              {error.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
