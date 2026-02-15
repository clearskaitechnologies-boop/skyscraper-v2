"use client";

import { useState } from "react";

type AddToTradeTeamButtonProps = {
  contractorId?: string;
  contractorSlug?: string;
  trade: string; // e.g. "ROOFING"
  propertyId?: string; // optional
  nicknameDefault?: string;
};

export function AddToTradeTeamButton(props: AddToTradeTeamButtonProps) {
  const { contractorId, contractorSlug, trade, propertyId, nicknameDefault } = props;

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleClick() {
    try {
      setLoading(true);
      setStatus("idle");
      setErrorMsg(null);

      const res = await fetch("/api/customer/trade-team/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorId,
          contractorSlug,
          trade,
          propertyId,
          nickname: nicknameDefault,
          makePrimary: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong");
        return;
      }

      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const label =
    status === "success"
      ? "Added to My Trade Team ✅"
      : loading
        ? "Adding..."
        : "Add to My Trade Team";

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || status === "success"}
        className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 disabled:opacity-60"
      >
        {label}
      </button>
      {status === "error" && errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
      {status === "success" && (
        <p className="text-xs text-emerald-600">This contractor is now saved to your Trade Team.</p>
      )}
    </div>
  );
}
