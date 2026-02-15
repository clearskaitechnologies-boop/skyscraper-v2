// Supplement Status Actions - Client component with RBAC
// Phase G: RBAC Implementation
// Approve/Deny buttons with permission check

"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { RBACGuard } from "@/components/rbac/RBACGuard";

interface SupplementStatusActionsProps {
  supplementId: string;
}

export function SupplementStatusActions({ supplementId }: SupplementStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: "approve" | "deny") {
    setLoading(action);
    setError(null);

    try {
      const res = await fetch(`/api/supplements/${supplementId}/${action}`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${action} supplement`);
      }

      // Refresh page to show new status
      router.refresh();
    } catch (err: any) {
      console.error(`[SupplementStatusActions] ${action} error:`, err);
      setError(err.message || `Failed to ${action} supplement`);
      setLoading(null);
    }
  }

  return (
    <RBACGuard
      permission="supplements:approve"
      fallback={
        <p className="text-sm italic text-slate-500">
          You don't have permission to approve/deny supplements
        </p>
      }
    >
      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="mb-3 text-sm text-slate-600">Update Status:</p>

        {error && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleAction("approve")}
            disabled={loading !== null}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading === "approve" ? "Approving..." : "Approve"}
          </button>

          <button
            type="button"
            onClick={() => handleAction("deny")}
            disabled={loading !== null}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            {loading === "deny" ? "Denying..." : "Deny"}
          </button>
        </div>
      </div>
    </RBACGuard>
  );
}
