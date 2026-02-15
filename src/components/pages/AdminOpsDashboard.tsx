import { Calendar, CheckCircle, FileText, RefreshCw,Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOpsDashboard() {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 29);

  const [range, setRange] = useState({
    from: start.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  });

  type OpsData = {
    kpis?: {
      leads?: number;
      demos?: number;
      reports?: number;
      approvals?: number;
    };
    series?: unknown[];
    recent?: {
      leads?: unknown[];
      demos?: unknown[];
      reports?: unknown[];
      approvals?: unknown[];
    };
  } | null;

  const [data, setData] = useState<OpsData>(null);
  const [loading, setLoading] = useState(false);

  async function loadMetrics() {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const supabaseUrl =
        (process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
        process.env.NEXT_PUBLIC_SUPABASE_URL;
      const fnUrl = `${supabaseUrl!.replace(
        "/rest/v1",
        ""
      )}/functions/v1/ops-metrics?from=${range.from}&to=${range.to}`;

      const response = await fetch(fnUrl, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      const result = await response.json();
      setData(result);
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("Failed to load metrics:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  const kpis = data?.kpis || { leads: 0, demos: 0, reports: 0, approvals: 0 };
  const series = data?.series || [];
  const recent = data?.recent || {
    leads: [],
    demos: [],
    reports: [],
    approvals: [],
  };

  return (
    <main className="container mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Operations Dashboard</h1>
          <p className="text-muted-foreground">Track key metrics and recent activity</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              type="date"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="date"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
              className="w-40"
            />
          </div>
          <Button onClick={loadMetrics} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Leads" value={kpis.leads || 0} icon={Users} />
        <KpiCard label="Demo Requests" value={kpis.demos || 0} icon={Calendar} />
        <KpiCard label="Reports" value={kpis.reports || 0} icon={FileText} />
        <KpiCard label="Approvals" value={kpis.approvals || 0} icon={CheckCircle} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Daily activity across all key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="leads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="demos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="reports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="approvals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#leads)"
                />
                <Area
                  type="monotone"
                  dataKey="demos"
                  stroke="hsl(var(--chart-2))"
                  fill="url(#demos)"
                />
                <Area
                  type="monotone"
                  dataKey="reports"
                  stroke="hsl(var(--chart-3))"
                  fill="url(#reports)"
                />
                <Area
                  type="monotone"
                  dataKey="approvals"
                  stroke="hsl(var(--chart-4))"
                  fill="url(#approvals)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Demo Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(recent.demos as unknown[] | undefined)?.map((item) => {
                const demo = item as Record<string, unknown>;
                return (
                  <div
                    key={String(demo["id"])}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div>
                      <p className="font-medium">{String(demo["name"] ?? "")}</p>
                      <p className="text-sm text-muted-foreground">{String(demo["email"] ?? "")}</p>
                      {demo["company"] ? (
                        <p className="text-xs text-muted-foreground">{String(demo["company"])}</p>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {demo["created_at"]
                        ? new Date(String(demo["created_at"])).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                );
              })}
              {(!recent.demos || recent.demos.length === 0) && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No demo requests yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(recent.leads as unknown[] | undefined)?.map((item) => {
                const lead = item as Record<string, unknown>;
                return (
                  <div
                    key={String(lead["id"])}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div>
                      <p className="font-medium">{String(lead["name"] ?? "")}</p>
                      <p className="text-sm text-muted-foreground">{String(lead["email"] ?? "")}</p>
                      {lead["phone"] ? (
                        <p className="text-xs text-muted-foreground">{String(lead["phone"])}</p>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {lead["created_at"]
                        ? new Date(String(lead["created_at"])).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                );
              })}
              {(!recent.leads || recent.leads.length === 0) && (
                <p className="py-8 text-center text-sm text-muted-foreground">No leads yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
