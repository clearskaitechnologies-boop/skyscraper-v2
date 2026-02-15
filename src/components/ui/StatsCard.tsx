import { LucideIcon } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  intent?: "default" | "success" | "warning" | "info";
  trend?: "up" | "down" | "neutral";
}

const intentColors = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-emerald-100 text-emerald-600",
  warning: "bg-orange-100 text-orange-600",
  info: "bg-blue-100 text-blue-600",
};

const valueColors = {
  default: "text-slate-900",
  success: "text-emerald-600",
  warning: "text-orange-600",
  info: "text-blue-600",
};

const deltaColors = {
  up: "text-emerald-600",
  down: "text-red-600",
  neutral: "text-gray-500",
};

export default function StatsCard({
  title,
  value,
  delta,
  icon: Icon,
  intent = "default",
  trend = "neutral",
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            intentColors[intent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      </div>
      <p className={cn("text-3xl font-bold", valueColors[intent])}>{value}</p>
      {delta && (
        <p className={cn("mt-1 flex items-center gap-1 text-sm", deltaColors[trend])}>
          {trend === "up" && <span>↗</span>}
          {trend === "down" && <span>↘</span>}
          {delta}
        </p>
      )}
    </div>
  );
}
