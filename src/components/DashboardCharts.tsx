"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,Tooltip, XAxis, YAxis } from "recharts";

import GlassCard from "./ui/MetricCard";

type MonthlyData = {
  month: string;
  count?: number;
  approved?: number;
  pending?: number;
  denied?: number;
};

type DashboardChartsProps = {
  reportsData?: MonthlyData[];
  claimsData?: MonthlyData[];
};

export default function DashboardCharts({ reportsData, claimsData }: DashboardChartsProps) {
  // Use provided data or show empty state
  const reports = reportsData && reportsData.length > 0 ? reportsData : getEmptyReportsData();
  const claims = claimsData && claimsData.length > 0 ? claimsData : getEmptyClaimsData();

  function getEmptyReportsData(): MonthlyData[] {
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map(month => ({ month, count: 0 }));
  }

  function getEmptyClaimsData(): MonthlyData[] {
    const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map(month => ({ month, approved: 0, pending: 0, denied: 0 }));
  }
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Reports Trend */}
      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold text-white">Reports Generated</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={reports}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: "#0ea5e9", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Claims Status */}
      <GlassCard>
        <h3 className="mb-4 text-lg font-semibold text-white">Claims by Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={claims}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Bar dataKey="approved" fill="#10b981" />
            <Bar dataKey="pending" fill="#f59e0b" />
            <Bar dataKey="denied" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
