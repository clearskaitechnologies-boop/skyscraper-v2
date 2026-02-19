"use client";

import { AlertCircle, ArrowLeft, RotateCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Error boundary for vendor detail pages.
 * Catches fetch failures, null vendor data, and rendering errors.
 */
export default function VendorDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Unable to Load Vendor</h2>
          <p className="text-sm text-muted-foreground">
            {error.message || "Something went wrong while loading the vendor details."}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={reset}>
            <RotateCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="default">
            <Link href="/vendor-network">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vendors
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
