"use client";

import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Client Component: Shows success toast when returning from branding setup
 */
export function BrandingSuccessToast() {
  const searchParams = useSearchParams();
  const showSuccess = searchParams?.get("branding") === "saved";

  useEffect(() => {
    if (showSuccess) {
      // Remove the query param after showing the toast
      const url = new URL(window.location.href);
      url.searchParams.delete("branding");
      window.history.replaceState({}, "", url.toString());
    }
  }, [showSuccess]);

  if (!showSuccess) return null;

  return (
    <div className="fixed right-4 top-20 z-50 animate-in fade-in slide-in-from-top-5">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Branding Saved!</p>
            <p className="text-sm text-green-700">Your company branding has been updated successfully.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
