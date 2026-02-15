"use client";

import { motion } from "framer-motion";

import GlassCard from "./ui/GlassCard";

interface KPI {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendUp?: boolean;
}

interface DashboardKPIsProps {
  metrics?: {
    totalLeads: number;
    activeJobs: number;
    revenue: number;
    conversionRate: number;
  };
}

export default function DashboardKPIs({ metrics }: DashboardKPIsProps) {
  const kpis: KPI[] = [
    {
      label: "Total Leads",
      value: metrics?.totalLeads || 0,
      icon: "👥",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Active Jobs",
      value: metrics?.activeJobs || 0,
      icon: "🏗️",
      trend: "+8%",
      trendUp: true,
    },
    {
      label: "Revenue",
      value: `$${((metrics?.revenue || 0) / 100).toLocaleString()}`,
      icon: "💰",
      trend: "+24%",
      trendUp: true,
    },
    {
      label: "Conversion Rate",
      value: `${metrics?.conversionRate || 0}%`,
      icon: "📈",
      trend: "-2%",
      trendUp: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">{kpi.label}</p>
                <p className="mt-1 text-2xl font-bold text-white">{kpi.value}</p>
                {kpi.trend && (
                  <p className={`mt-2 text-xs ${kpi.trendUp ? "text-green-400" : "text-red-400"}`}>
                    {kpi.trend} from last month
                  </p>
                )}
              </div>
              <div className="text-3xl">{kpi.icon}</div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
