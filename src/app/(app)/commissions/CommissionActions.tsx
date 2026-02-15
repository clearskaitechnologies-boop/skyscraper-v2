"use client";

import { useState } from "react";

export default function CommissionActions({
  recordId,
  pending,
  owed,
}: {
  recordId: string;
  pending: number;
  owed: number;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleAction(action: "approve" | "mark_paid") {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, action }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus(action === "approve" ? "Approved ✓" : "Paid ✓");
    } catch {
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <span className="text-xs text-slate-400">Processing...</span>;
  }

  if (status) {
    return <span className="text-xs text-green-500">{status}</span>;
  }

  return (
    <div className="flex justify-center gap-2">
      {pending > 0 && (
        <button
          onClick={() => handleAction("approve")}
          className="rounded-lg bg-yellow-600/20 px-2 py-1 text-xs font-medium text-yellow-600 transition-colors hover:bg-yellow-600/30 dark:text-yellow-400"
        >
          Approve
        </button>
      )}
      {owed > 0 && (
        <button
          onClick={() => handleAction("mark_paid")}
          className="rounded-lg bg-green-600/20 px-2 py-1 text-xs font-medium text-green-600 transition-colors hover:bg-green-600/30 dark:text-green-400"
        >
          Pay
        </button>
      )}
    </div>
  );
}
