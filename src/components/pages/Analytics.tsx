import { BarChart3, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { PageSectionCard } from "@/components/layout/PageSectionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [userId, setUserId] = useState<string>("");
  const [daily, setDaily] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userId) params.set("user_id", userId);
      params.set("days", String(days));

      const [dailyRes, funnelRes] = await Promise.all([
        supabase.functions.invoke("analytics-daily", {
          body: {},
          method: "GET",
        }),
        supabase.functions.invoke("analytics-funnel", {
          body: {},
          method: "GET",
        }),
      ]);

      if (dailyRes.data?.items) setDaily(dailyRes.data.items);
      if (funnelRes.data?.items) setFunnel(funnelRes.data.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [days, userId]);

  const kpis = useMemo(() => {
    const slice = daily.slice(-7);
    const sum = (k: string) => slice.reduce((acc, x) => acc + (x[k] || 0), 0);
    return {
      ai: sum("ai_actions"),
      exports: sum("exports"),
      views: sum("share_views"),
      payments: sum("payments"),
      esigns: sum("esigns"),
    };
  }, [daily]);

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        section="command"
        title="Analytics Dashboard"
        subtitle="Track performance metrics and usage trends"
        icon={<BarChart3 className="h-6 w-6" />}
      >
        <Button
          onClick={load}
          disabled={loading}
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </PageHero>

      <div className="space-y-6">
        {/* Filters */}
        <PageSectionCard title="Filters">
          <div className="flex items-center gap-2">
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Filter by User ID"
              className="w-64"
            />
            <Input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value || 30))}
              className="w-24"
              min="1"
              max="180"
              placeholder="Days"
            />
          </div>
        </PageSectionCard>

        {/* KPIs */}
        <PageSectionCard title="Key Metrics (Last 7 Days)">
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="p-6">
                <div className="mb-1 text-sm text-muted-foreground">AI Actions</div>
                <div className="text-3xl font-bold">{kpis.ai}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-1 text-sm text-muted-foreground">PDF Exports</div>
                <div className="text-3xl font-bold">{kpis.exports}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-1 text-sm text-muted-foreground">Share Views</div>
                <div className="text-3xl font-bold">{kpis.views}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-1 text-sm text-muted-foreground">Payments</div>
                <div className="text-3xl font-bold">{kpis.payments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-1 text-sm text-muted-foreground">eSigns</div>
                <div className="text-3xl font-bold">{kpis.esigns}</div>
              </CardContent>
            </Card>
          </div>
        </PageSectionCard>

        {/* Daily time series */}
        <PageSectionCard title={`Daily Activity (last ${days} days)`}>
          {daily.length === 0 ? (
            <div className="py-16 text-center">
              <TrendingUp className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No activity data available yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Data will appear here once reports are generated
              </p>
            </div>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={daily} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                  <YAxis allowDecimals={false} />
                  <Tooltip labelFormatter={(v) => new Date(v as any).toLocaleDateString()} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ai_actions"
                    name="AI"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="exports"
                    name="Exports"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="share_views"
                    name="Views"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="payments"
                    name="Payments"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="esigns"
                    name="eSigns"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </PageSectionCard>

        {/* Funnel bar */}
        <PageSectionCard title="Report Funnel Completion">
          {funnel.length === 0 ? (
            <div className="py-16 text-center">
              <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No funnel data available yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Data will appear here once reports progress through stages
              </p>
            </div>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={funnel} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Reports" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </PageSectionCard>
      </div>
    </PageContainer>
  );
}
