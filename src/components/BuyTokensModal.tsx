import { useState } from "react";

export function BuyTokensModal({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(false);
  const [pack, setPack] = useState<"pack10" | "pack50" | "pack150">("pack10");

  async function checkout() {
    setLoading(true);
    const r = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_id: orgId, pack_id: pack }),
    });
    const j = await r.json();
    setLoading(false);
    if (j.url) window.location.href = j.url;
  }

  return (
    <div className="space-y-3">
      <select
        className="rounded border p-2"
        value={pack}
        onChange={(e) => setPack(e.target.value as any)}
      >
        <option value="pack10">10 Tokens — $10</option>
        <option value="pack50">50 Tokens — $40</option>
        <option value="pack150">150 Tokens — $100</option>
      </select>
      <button
        onClick={checkout}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        {loading ? "Redirecting…" : "Buy Tokens"}
      </button>
    </div>
  );
}
