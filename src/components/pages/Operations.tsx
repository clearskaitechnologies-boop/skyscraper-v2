import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface HealthData {
  heartbeats: Array<{ name: string; last_beat: string; notes?: string }>;
  webhooks: Array<{
    id: string;
    last_ok_at?: string;
    last_event_at?: string;
    last_error_at?: string;
    last_error?: string;
  }>;
  errors24h: Array<{ severity: string; count: number }>;
  env: {
    storageBucketReports: boolean;
    mapbox: boolean;
    stripe: boolean;
    lovableAI: boolean;
  };
}

export default function OperationsPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data: healthData, error } = await supabase.functions.invoke("ops-health", {
        method: "GET",
      });
      if (error) throw error;
      setData(healthData);
    } catch (error) {
      console.error("Failed to load ops data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "error":
        return "destructive";
      case "warn":
        return "default";
      case "info":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Operations Dashboard</h1>
        <Button onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Environment Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.env && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mapbox</span>
                  <Badge variant={data.env.mapbox ? "default" : "destructive"}>
                    {data.env.mapbox ? "Connected" : "Missing"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stripe</span>
                  <Badge variant={data.env.stripe ? "default" : "destructive"}>
                    {data.env.stripe ? "Connected" : "Missing"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lovable AI</span>
                  <Badge variant={data.env.lovableAI ? "default" : "destructive"}>
                    {data.env.lovableAI ? "Connected" : "Missing"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage (reports)</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.webhooks && data.webhooks.length > 0 ? (
              data.webhooks.map((w) => (
                <div key={w.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{w.id}</span>
                    {w.last_error_at ? (
                      <Badge variant="destructive">Error</Badge>
                    ) : (
                      <Badge variant="default">OK</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last OK: {w.last_ok_at ? new Date(w.last_ok_at).toLocaleString() : "—"}
                  </div>
                  {w.last_error && <div className="text-xs text-destructive">{w.last_error}</div>}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No webhook status recorded yet</div>
            )}
          </CardContent>
        </Card>

        {/* Errors (last 24h) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Errors (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.errors24h && data.errors24h.length > 0 ? (
              data.errors24h.map((e) => (
                <div key={e.severity} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{e.severity}</span>
                  <Badge variant={getSeverityColor(e.severity) as any}>{e.count}</Badge>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-600" />
                No errors in last 24h
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Heartbeats */}
      {data?.heartbeats && data.heartbeats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>System Heartbeats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {data.heartbeats.map((hb) => (
                <div key={hb.name} className="rounded-lg border p-4">
                  <div className="font-medium capitalize">{hb.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Last beat: {hb.last_beat ? new Date(hb.last_beat).toLocaleString() : "Never"}
                  </div>
                  {hb.notes && <div className="mt-1 text-xs text-muted-foreground">{hb.notes}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
