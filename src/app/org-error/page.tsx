/**
 * /org-error - Corrupt Organization State Error Page
 *
 * Shown when Clerk thinks user has an org but DB is out of sync.
 * Provides repair action via /api/org/bootstrap.
 */

"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function OrgErrorPage() {
  const router = useRouter();
  const [isRepairing, setIsRepairing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRepair() {
    setIsRepairing(true);
    setError(null);

    try {
      // Use nuclear reset to completely fix the account
      const response = await fetch("/api/org/nuclear-reset", { method: "POST" });
      const data = await response.json();

      if (data.ok) {
        // Success - redirect to dashboard
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Repair failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setIsRepairing(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-xl dark:border-red-900 dark:bg-slate-900">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-white">
          Organization Sync Error
        </h1>

        <p className="mb-6 text-center text-slate-600 dark:text-slate-400">
          Your organization data is out of sync. This can happen after account changes or system
          updates. Click below to repair your account.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleRepair}
            disabled={isRepairing}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isRepairing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Repairing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Repair My Account
              </>
            )}
          </Button>

          <Button variant="outline" onClick={() => router.push("/sign-in")} className="w-full">
            Sign Out & Try Again
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
          If this error persists, please contact{" "}
          <a href="mailto:support@skaiscrape.com" className="text-blue-600 hover:underline">
            support@skaiscrape.com
          </a>
        </p>
      </div>
    </div>
  );
}
