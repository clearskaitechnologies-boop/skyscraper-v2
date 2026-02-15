import { useEffect, useState } from "react";

import { BuyTokensModal } from "@/components/BuyTokensModal";
import QuotaBadge from "@/components/QuotaBadge";

const ym = new Date().toISOString().slice(0, 7);

export default function PostJobPage() {
  const orgId = process.env.NEXT_PUBLIC_DEV_ORG ?? "00000000-0000-0000-0000-000000000000";
  const [canPost, setCanPost] = useState(false);
  const [tokens, setTokens] = useState(0);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/network/status?org_id=${orgId}&ym=${ym}`);
      const j = await r.json();
      const left = Math.max(0, j.limits.post - j.usage.post);
      setCanPost(left > 0 || j.tokens.balance >= 5);
      setTokens(j.tokens.balance);
    })();
  }, []);

  async function submit() {
    if (!canPost) return alert("Not enough quota or tokens.");
    await fetch("/api/network/usage/increment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ org_id: orgId, kind: "post", amount: 1, year_month: ym }),
    });
    alert("Job posted!");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Post a Job</h1>
      <QuotaBadge orgId={orgId} yearMonth={ym} kind="post" />
      <textarea className="w-full rounded border p-3" rows={6} placeholder="Describe the job…" />
      <div className="flex items-center gap-4">
        <button
          onClick={submit}
          disabled={!canPost}
          className={`rounded px-4 py-2 ${canPost ? "bg-blue-600 text-white" : "cursor-not-allowed bg-gray-200 text-gray-500"}`}
        >
          Post Job
        </button>
        {!canPost && <BuyTokensModal orgId={orgId} />}
        <span className="text-sm text-gray-500">Tokens: {tokens}</span>
      </div>
    </div>
  );
}
