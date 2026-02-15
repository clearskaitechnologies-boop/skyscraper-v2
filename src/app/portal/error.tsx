"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Portal Error Boundary
 *
 * Catches runtime errors in the portal and displays a friendly error page
 * with options to retry or go home.
 */
export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[Portal Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-slate-900">Portal Error</CardTitle>
          <CardDescription className="text-slate-600">
            Something went wrong loading this page. Don&apos;t worry, your data is safe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error details for debugging (only in development) */}
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="rounded-lg bg-red-50 p-3 text-sm">
              <p className="font-medium text-red-800">Error Details:</p>
              <p className="mt-1 text-red-700">{error.message}</p>
              {error.digest && <p className="mt-1 text-xs text-red-500">Digest: {error.digest}</p>}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={reset}
              variant="default"
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => (window.location.href = "/portal")}
            >
              <Home className="h-4 w-4" />
              Go to Portal Home
            </Button>
          </div>

          <p className="text-center text-xs text-slate-500">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
