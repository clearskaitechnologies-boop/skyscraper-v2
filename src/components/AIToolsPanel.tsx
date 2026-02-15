"use client";
import { useEffect,useState } from "react";

import { getAllTools, ToolDefinition } from "@/lib/tools";

interface QuotaStatus {
  plan: {
    name: string;
    slug: string;
    monthlyTokens: number;
  };
  seats: {
    allowed: boolean;
    currentSeats: number;
    maxSeats: number;
  };
  daily: Record<
    string,
    {
      used: number;
      limit: number;
      allowed: boolean;
    }
  >;
}

const toolRoutes = {
  weather_claim: "/api/generate-pdf",
  mockup: "/api/generate-mockup",
  dol_pull: "/api/dol-check",
};

export default function AIToolsPanel() {
  const [msg, setMsg] = useState<string>("");
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const tools = getAllTools();

  useEffect(() => {
    loadQuotaStatus();
  }, []);

  async function loadQuotaStatus() {
    try {
      const response = await fetch("/api/quota/status");
      if (response.ok) {
        const data = await response.json();
        setQuotaStatus(data);
      }
    } catch (error) {
      console.error("Failed to load quota status:", error);
    }
  }

  async function run(tool: ToolDefinition) {
    setLoading(true);
    setMsg(`Running ${tool.name}...`);

    const route = toolRoutes[tool.key];
    const response = await fetch(route, {
      method: "POST",
      body: JSON.stringify({ demo: true }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json().catch(() => ({}));

    let statusText = "ERR";
    if (response.ok) {
      statusText = "OK";
    } else if (response.status === 429) {
      statusText = "QUOTA_EXCEEDED";
    } else if (response.status === 402) {
      statusText = "INSUFFICIENT_TOKENS";
    } else if (response.status === 403) {
      statusText = "SEAT_LIMIT";
    }

    setMsg(
      `${tool.name}: ${response.status} ${statusText} — ${JSON.stringify(result).slice(0, 200)}`
    );

    // Refresh quota status after successful tool use
    if (response.ok) {
      await loadQuotaStatus();
    }

    setLoading(false);
  }

  const getQuotaInfo = (toolKey: string) => {
    if (!quotaStatus?.daily[toolKey]) return null;
    const quota = quotaStatus.daily[toolKey];
    return `${quota.used}/${quota.limit} used today`;
  };

  const isToolDisabled = (toolKey: string) => {
    if (loading) return true;
    if (!quotaStatus) return false;

    if (!quotaStatus.seats.allowed) return true;
    if (quotaStatus.daily[toolKey] && !quotaStatus.daily[toolKey].allowed) return true;

    return false;
  };

  return (
    <div className="space-y-4">
      {/* Quota Status Summary */}
      {quotaStatus && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <div className="text-sm font-medium text-neutral-900">{quotaStatus.plan.name} Plan</div>
          <div className="text-xs text-neutral-600">
            Seats: {quotaStatus.seats.currentSeats}/{quotaStatus.seats.maxSeats}
            {!quotaStatus.seats.allowed && (
              <span className="ml-2 text-red-600">⚠️ Limit exceeded</span>
            )}
          </div>
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid gap-3 md:grid-cols-3">
        {tools.map((tool) => {
          const disabled = isToolDisabled(tool.key);
          const quotaInfo = getQuotaInfo(tool.key);

          return (
            <button
              key={tool.key}
              onClick={() => run(tool)}
              disabled={disabled}
              className={`rounded-lg border p-4 text-left transition-all ${
                disabled
                  ? "cursor-not-allowed border-neutral-300 bg-neutral-100 text-neutral-400"
                  : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{tool.icon}</span>
                <div className="font-medium">{tool.name}</div>
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                {tool.tokenCost} tokens • {tool.category}
              </div>
              {quotaInfo && <div className="mt-1 text-xs text-neutral-600">{quotaInfo}</div>}
              <div className="mt-1 break-all text-xs text-neutral-400">{tool.description}</div>
            </button>
          );
        })}
      </div>

      {/* Status Message */}
      {msg && (
        <div className="rounded-lg border bg-neutral-50 p-3 text-sm text-neutral-700">{msg}</div>
      )}
    </div>
  );
}
