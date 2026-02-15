"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ClaimsPublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[PUBLIC_CLAIMS_ERROR]", error);

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-10 text-center">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <div>
        <h1 className="text-2xl font-semibold">Claims demo is temporarily unavailable</h1>
        <p className="mt-2 text-muted-foreground">
          Something went wrong loading the public claims workspace. Please try again. If this keeps
          happening, share the error digest with support.
        </p>
      </div>
      {error?.digest && (
        <code className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground/80">
          digest: {error.digest}
        </code>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href="/api/diag/ready" target="_blank" rel="noreferrer">
            View diagnostics
          </a>
        </Button>
      </div>
    </div>
  );
}
