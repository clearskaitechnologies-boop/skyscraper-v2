"use client";

import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingStartPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [status, setStatus] = useState<"initializing" | "success" | "error">("initializing");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    // Initialize organization
    const initOrg = async () => {
      try {
        const res = await fetch("/api/onboarding/init", {
          method: "POST",
        });
        const data = await res.json();
        
        if (data.ok) {
          setStatus("success");
          // Wait a moment for database to propagate, then redirect
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } else {
          setError(data.error || "Failed to initialize");
          setStatus("error");
        }
      } catch (err: any) {
        setError(err.message || "Network error");
        setStatus("error");
      }
    };

    initOrg();
  }, [userId, isLoaded, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-white dark:bg-gray-900 p-8 shadow-2xl space-y-6">
        {status === "initializing" && (
          <>
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-center">Setting up your workspace...</h1>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Creating your organization and preparing your dashboard
            </p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-green-700 dark:text-green-400">Workspace Ready!</h1>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Redirecting to your dashboard...
            </p>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <span className="text-2xl">✕</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-red-700 dark:text-red-400">Setup Failed</h1>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded bg-blue-600 text-white font-medium"
              >
                Retry
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
