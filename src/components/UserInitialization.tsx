"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserInitialization() {
  const [status, setStatus] = useState<"initializing" | "success" | "error">("initializing");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    async function initializeUser() {
      try {
        const response = await fetch("/api/me/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!isMounted) return;

        if (!response.ok) {
          throw new Error("Failed to initialize user");
        }

        const data = await response.json();

        if (!isMounted) return;

        if (data.ok) {
          setStatus("success");
          // Just reload the current page instead of redirecting to dashboard
          timeoutId = setTimeout(() => {
            if (isMounted) {
              window.location.reload();
            }
          }, 1500);
        } else {
          throw new Error(data.error || "Initialization failed");
        }
      } catch (err) {
        if (!isMounted) return;

        console.error("User initialization error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setStatus("error");
      }
    }

    initializeUser();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleRetry = () => {
    setStatus("initializing");
    setError(null);
    // Use location.replace to avoid history issues
    window.location.replace(window.location.href);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        {status === "initializing" && (
          <>
            <div className="mx-auto mb-6 animate-spin">
              <Loader2 className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-slate-900">Setting up your account...</h2>
            <p className="mb-4 text-slate-600">
              We're initializing your SKai-Scraper workspace. This will only take a moment.
            </p>
            <div className="h-2 w-full rounded-full bg-slate-200">
              <div className="h-2 w-3/4 animate-pulse rounded-full bg-blue-600"></div>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-slate-900">Account Ready!</h2>
            <p className="text-slate-600">
              Your SKai-Scraper workspace has been set up successfully. Redirecting to dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-slate-900">Setup Error</h2>
            <p className="mb-4 text-slate-600">
              {error || "There was an issue setting up your account. Please try again."}
            </p>
            <button
              onClick={handleRetry}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
