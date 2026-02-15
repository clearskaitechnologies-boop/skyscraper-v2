"use client";

import useSWR from "swr";

import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AgentPanel({ jobId }: { jobId: string }) {
  const { data } = useSWR(`/api/agent/state?jobId=${jobId}`, fetcher, {
    refreshInterval: 5000, // Poll every 5 seconds
  });

  if (!data) return null;

  const handleApprove = async (missionId: string) => {
    await fetch("/api/agent/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, missionId }),
    });
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
      <h3 className="text-lg font-semibold">🤖 AI Agent Status</h3>

      {data.pending?.map((t: any) => (
        <div key={t.id} className="text-sm">
          <strong>{t.missionId}</strong> — {t.status}
        </div>
      ))}

      {data.awaitingApproval?.length > 0 && (
        <Button
          size="sm"
          onClick={() => handleApprove(data.awaitingApproval[0].missionId)}
        >
          ✅ Approve & Continue
        </Button>
      )}
    </div>
  );
}
