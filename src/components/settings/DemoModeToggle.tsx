"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DemoModeToggleProps {
  orgId: string;
  demoMode: boolean;
  demoSeededAt: string | null;
}

export function DemoModeToggle({ orgId, demoMode, demoSeededAt }: DemoModeToggleProps) {
  const [enabled, setEnabled] = useState(demoMode);
  const [seededAt, setSeededAt] = useState<string | null>(demoSeededAt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = enabled ? "/api/dev/clear-org-demo" : "/api/dev/seed-org-demo";
      const res = await fetch(endpoint, { method: "POST" });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Request failed");
      }
      setEnabled(Boolean(payload.demoMode));
      setSeededAt(payload.demoSeededAt ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update demo mode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Enable demo jobs & sample pipeline</div>
          <div className="text-xs text-muted-foreground">
            Demo records are tagged and can be removed safely.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "ON" : "OFF"}</Badge>
          <Button size="sm" variant={enabled ? "destructive" : "default"} onClick={handleToggle}>
            {loading ? "Working..." : enabled ? "Disable" : "Enable"}
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Org: <span className="font-medium text-foreground">{orgId}</span>
        {seededAt && <span className="ml-2">Seeded {new Date(seededAt).toLocaleString()}</span>}
      </div>

      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}
