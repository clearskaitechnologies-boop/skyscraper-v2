"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Client Portal Error]", error);
    // Report to Sentry
    Sentry.captureException(error, {
      tags: {
        component: "client-portal-error-boundary",
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
          <p className="text-sm text-slate-600">
            We encountered an error loading this page. This has been logged and we'll look into it.
          </p>
        </div>

        {/* Error details (non-production only) */}
        {process.env.NODE_ENV !== "production" && (
          <div className="rounded-lg bg-slate-100 p-4 text-left">
            <p className="font-mono text-xs text-slate-700">{error.message || "Unknown error"}</p>
            {error.digest && (
              <p className="mt-2 text-xs text-slate-500">Error ID: {error.digest}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="bg-blue-600 hover:bg-blue-700">
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/portal" className="gap-2">
              <Home className="h-4 w-4" />
              Go to Portal Home
            </Link>
          </Button>
        </div>

        {/* Support */}
        <p className="text-xs text-slate-500">
          If this problem persists, please contact your contractor for support.
        </p>
      </div>
    </div>
  );
}
