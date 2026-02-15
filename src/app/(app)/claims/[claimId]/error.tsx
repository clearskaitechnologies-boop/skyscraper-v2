"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ClaimError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ClaimError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-lg">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Unable to Load Claim</h2>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          {error.message || "An unexpected error occurred while loading this claim."}
        </p>
        <div className="mt-4 flex gap-2">
          <Button onClick={reset} className="bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
          <Button asChild variant="outline">
            <a href="/claims">Back to Claims</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
