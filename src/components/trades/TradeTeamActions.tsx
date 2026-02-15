"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

type TradeTeamActionsProps = {
  linkId: string;
  isPrimary: boolean;
};

export function TradeTeamActions({ linkId, isPrimary }: TradeTeamActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSetPrimary() {
    try {
      setBusy(true);
      setError(null);

      const res = await fetch("/api/customer/trade-team/set-primary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to set primary");
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    try {
      setBusy(true);
      setError(null);

      const res = await fetch("/api/customer/trade-team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to remove");
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex gap-2">
        {!isPrimary && (
          <button
            type="button"
            disabled={busy}
            onClick={handleSetPrimary}
            className="rounded-full border border-slate-300 px-2 py-1 hover:bg-slate-50 disabled:opacity-60"
          >
            Set Primary
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={handleRemove}
          className="rounded-full border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          Remove
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
