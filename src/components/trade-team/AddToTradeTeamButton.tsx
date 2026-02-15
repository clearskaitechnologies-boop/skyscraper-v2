"use client";

import { useState } from "react";

type Props = {
  contractorId: string;
  contractorName: string;
  defaultTrade?: string; // e.g. "ROOFING"
  defaultRole?: string;  // "HOMEOWNER" | "RENTER" ...
};

export function AddToTradeTeamButton({
  contractorId,
  contractorName,
  defaultTrade = "ROOFING",
  defaultRole = "HOMEOWNER",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | "idle" | "added" | "exists" | "error">(null);

  async function handleClick() {
    try {
      setLoading(true);
      setStatus(null);

      // In Phase 1.2 we keep it SUPER simple:
      // No property selection, no nickname prompt yet.
      const res = await fetch("/api/trade-team/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorId,
          trade: defaultTrade,
          role: defaultRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Trade team error", data);
        setStatus("error");
        return;
      }

      if (data.status === "already_exists") {
        setStatus("exists");
      } else {
        setStatus("added");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  let label = "Add to My Trade Team";
  if (status === "added") label = "✅ Added to My Trade Team";
  if (status === "exists") label = "✅ Already in My Trade Team";
  if (status === "error") label = "⚠️ Try Again";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 disabled:opacity-60"
    >
      <span>{label}</span>
      {loading && <span className="text-xs opacity-70">…</span>}
    </button>
  );
}
