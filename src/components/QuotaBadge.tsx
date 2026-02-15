import { useEffect, useState } from "react";

type Props = { orgId: string; yearMonth: string; kind: "post" | "outreach" };

export default function QuotaBadge({ orgId, yearMonth, kind }: Props) {
  const [state, setState] = useState<{ limit: number; used: number; balance: number } | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/network/status?org_id=${orgId}&ym=${yearMonth}`);
      const j = await r.json();
      setState({
        limit: j.limits[kind],
        used: j.usage[kind],
        balance: j.tokens.balance,
      });
    })();
  }, [orgId, yearMonth, kind]);

  if (!state) return null;
  const left = Math.max(0, state.limit - state.used);
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700">
      {kind === "post" ? "Posts" : "Outreach"}: {left}/{state.limit} • Tokens: {state.balance}
    </span>
  );
}
