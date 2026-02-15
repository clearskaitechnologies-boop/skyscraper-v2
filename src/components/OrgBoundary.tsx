"use client";

/**
 * OrgBoundary - Client-side org resolution guard
 *
 * This component MUST be used as a wrapper for all org-protected pages.
 * It handles:
 * - Loading state while org resolves
 * - Redirect only AFTER resolution fails (not during render)
 * - Never throws, never blocks SSR
 *
 * Usage:
 * <OrgBoundary>
 *   <YourPageContent />
 * </OrgBoundary>
 */

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface OrgBoundaryProps {
  children: ReactNode;
  fallbackUrl?: string;
  loadingText?: string;
}

interface OrgState {
  status: "loading" | "resolved" | "failed";
  orgId: string | null;
  error: string | null;
}

export function OrgBoundary({
  children,
  fallbackUrl = "/onboarding",
  loadingText = "Loading workspace...",
}: OrgBoundaryProps) {
  const router = useRouter();
  const [orgState, setOrgState] = useState<OrgState>({
    status: "loading",
    orgId: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function resolveOrg() {
      try {
        // Call our diagnostic endpoint to get org context
        const res = await fetch("/api/diag/org", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (cancelled) return;

        if (data.resolution?.ok && data.resolution?.orgId) {
          setOrgState({
            status: "resolved",
            orgId: data.resolution.orgId,
            error: null,
          });
        } else {
          setOrgState({
            status: "failed",
            orgId: null,
            error: data.resolution?.reason || "No org found",
          });
        }
      } catch (err: any) {
        if (cancelled) return;
        setOrgState({
          status: "failed",
          orgId: null,
          error: err.message || "Failed to resolve org",
        });
      }
    }

    resolveOrg();

    return () => {
      cancelled = true;
    };
  }, []);

  // Loading state - show skeleton
  if (orgState.status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-slate-600 dark:text-slate-400">{loadingText}</p>
        </div>
      </div>
    );
  }

  // Failed state - redirect
  if (orgState.status === "failed") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-slate-900">
          <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Organization Required
          </h2>
          <p className="mb-4 text-slate-600 dark:text-slate-400">
            You need to join or create an organization to access this page.
          </p>
          <p className="mb-4 text-xs text-slate-400">{orgState.error}</p>
          <button
            onClick={() => router.push(fallbackUrl)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Resolved - render children
  return <>{children}</>;
}

/**
 * Server-side org guard - use in Server Components
 * Returns org context or null (NEVER throws, NEVER redirects)
 */
export async function getServerOrgContext() {
  try {
    const { safeOrgContext } = await import("@/lib/safeOrgContext");
    const ctx = await safeOrgContext();

    if (ctx.status === "ok" && ctx.orgId) {
      return {
        ok: true as const,
        orgId: ctx.orgId,
        userId: ctx.userId,
        role: ctx.role,
      };
    }

    return {
      ok: false as const,
      reason: ctx.status,
    };
  } catch (error: any) {
    console.error("[getServerOrgContext] Error:", error);
    return {
      ok: false as const,
      reason: "error",
      error: error.message,
    };
  }
}
