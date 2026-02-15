import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

type FunnelCohortRow = {
  week: string;
  leads: number;
  demos: number;
  reports: number;
  approvals: number;
};
type FunnelRepRow = {
  owner_id: string;
  leads: number;
  demos: number;
  reports: number;
  approvals: number;
};
type FunnelTotals = {
  step1: number;
  step2: number;
  step3: number;
  step4: number;
  conv12: number;
  conv23: number;
  conv34: number;
  conv14: number;
};
type FunnelLatency = {
  lead_to_demo: number;
  demo_to_report: number;
  report_to_approval: number;
};
type FunnelData = {
  totals: FunnelTotals;
  latency: FunnelLatency;
  cohort?: FunnelCohortRow[];
  reps?: FunnelRepRow[];
};

export default function AdminFunnels() {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 29);

  const [range, setRange] = useState({
    from: start.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  });

  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadFunnels() {
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
      )}/functions/v1/ops-funnel?from=${range.from}&to=${range.to}`;

      const response = await fetch(fnUrl, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      const result = (await response.json()) as unknown;
      if (result && typeof result === "object") {
        setData(result as FunnelData);
      } else {
        setData(null);
      }
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("Failed to load funnels:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFunnels();
  }, []);

  const funnelData = data
    ? [
        {
          name: "Leads",
          value: data.totals.step1,
          color: "hsl(var(--chart-1))",
        },
        {
          name: "Demos",
          value: data.totals.step2,
          color: "hsl(var(--chart-2))",
        },
        {
          name: "Reports",
          value: data.totals.step3,
          color: "hsl(var(--chart-3))",
        },
        {
          name: "Approvals",
          value: data.totals.step4,
          color: "hsl(var(--chart-4))",
        },
      ]
    : [];

  return (
    <main className="container mx-auto space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Funnels & Conversion</h1>
          <p className="text-muted-foreground">Track conversion from leads to approvals</p>
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
          <Button onClick={loadFunnels} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar dataKey="value" radius={4}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {data && (
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                <div>Lead→Demo: {(data.totals.conv12 * 100).toFixed(0)}%</div>
                <div>Demo→Report: {(data.totals.conv23 * 100).toFixed(0)}%</div>
                <div>Report→Approval: {(data.totals.conv34 * 100).toFixed(0)}%</div>
                <div className="pt-2 font-semibold">
                  Overall Lead→Approval: {(data.totals.conv14 * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage Latency (Median Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {data ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm">Lead → Demo</span>
                  <span className="text-2xl font-bold">{data.latency.lead_to_demo.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm">Demo → Report</span>
                  <span className="text-2xl font-bold">
                    {data.latency.demo_to_report.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm">Report → Approval</span>
                  <span className="text-2xl font-bold">
                    {data.latency.report_to_approval.toFixed(1)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Loading...</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2">Week</th>
                    <th className="pb-2">Leads</th>
                    <th className="pb-2">Demos</th>
                    <th className="pb-2">Reports</th>
                    <th className="pb-2">Approvals</th>
                    <th className="pb-2">Conv%</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.cohort?.map((c: FunnelCohortRow) => (
                    <tr key={c.week} className="border-b">
                      <td className="py-2">{c.week}</td>
                      <td>{c.leads}</td>
                      <td>{c.demos}</td>
                      <td>{c.reports}</td>
                      <td>{c.approvals}</td>
                      <td>{c.leads ? Math.round((100 * c.approvals) / c.leads) : 0}%</td>
                    </tr>
                  ))}
                  {(!data?.cohort || data.cohort.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No data for selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Per-Rep Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2">Owner</th>
                    <th className="pb-2">Leads</th>
                    <th className="pb-2">Demos</th>
                    <th className="pb-2">Reports</th>
                    <th className="pb-2">Approvals</th>
                    <th className="pb-2">Conv%</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.reps?.map((r: FunnelRepRow) => (
                    <tr key={r.owner_id} className="border-b">
                      <td className="py-2 font-mono text-xs">
                        {r.owner_id === "unassigned" ? "Unassigned" : r.owner_id.slice(0, 8)}
                      </td>
                      <td>{r.leads}</td>
                      <td>{r.demos}</td>
                      <td>{r.reports}</td>
                      <td>{r.approvals}</td>
                      <td>{r.leads ? Math.round((100 * r.approvals) / r.leads) : 0}%</td>
                    </tr>
                  ))}
                  {(!data?.reps || data.reps.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No data for selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
