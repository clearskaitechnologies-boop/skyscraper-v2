"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  MetricCard — Unified stat / KPI / metric display                  */
/*  Replaces:                                                          */
/*    - src/components/ui/StatCard.tsx                                  */
/*    - src/components/ui/StatsCard.tsx                                 */
/*    - src/components/ui/KpiCard.tsx                                   */
/*    - src/components/ui/GlassCard.tsx                                 */
/* ------------------------------------------------------------------ */

export type MetricCardGradient =
  | "primary"
  | "blue"
  | "purple"
  | "indigo"
  | "cyan"
  | "success"
  | "error"
  | "warning";

export type MetricCardIntent = "default" | "success" | "warning" | "info" | "danger";

export interface MetricCardProps {
  /** Main label / title */
  label: string;
  /** The main numeric or string value */
  value: string | number;
  /** Optional icon (LucideIcon element or ReactNode) */
  icon?: React.ReactNode;
  /** Optional trend data */
  trend?: {
    value: number | string;
    direction: "up" | "down" | "flat";
  };
  /** Visual variant */
  variant?: "default" | "gradient" | "solid" | "glass" | "outline";
  /** Gradient / solid color */
  gradientColor?: MetricCardGradient;
  /** Semantic intent colors for default variant */
  intent?: MetricCardIntent;
  /** Description / subtitle */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Framer-motion animation delay */
  delay?: number;
}

const gradientTokens: Record<MetricCardGradient, string> = {
  primary: "bg-gradient-to-br from-blue-600 to-blue-800",
  blue: "bg-gradient-to-br from-blue-500 to-blue-700",
  purple: "bg-gradient-to-br from-purple-500 to-purple-700",
  indigo: "bg-gradient-to-br from-indigo-500 to-indigo-700",
  cyan: "bg-gradient-to-br from-cyan-500 to-cyan-700",
  success: "bg-gradient-to-br from-green-500 to-green-700",
  error: "bg-gradient-to-br from-red-500 to-red-700",
  warning: "bg-gradient-to-br from-orange-500 to-orange-700",
};

const solidColors: Record<MetricCardGradient, string> = {
  primary: "bg-blue-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  indigo: "bg-indigo-500",
  cyan: "bg-cyan-500",
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-orange-500",
};

const intentIconBg: Record<MetricCardIntent, string> = {
  default: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  danger: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

function TrendBadge({ trend, light }: { trend: MetricCardProps["trend"]; light?: boolean }) {
  if (!trend) return null;
  const upColor = light ? "text-white/90" : "text-emerald-600 dark:text-emerald-400";
  const downColor = light ? "text-white/70" : "text-red-600 dark:text-red-400";
  const flatColor = light ? "text-white/60" : "text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        trend.direction === "up" ? upColor : trend.direction === "down" ? downColor : flatColor
      )}
    >
      {trend.direction === "up" && <TrendingUp className="h-3 w-3" />}
      {trend.direction === "down" && <TrendingDown className="h-3 w-3" />}
      {typeof trend.value === "number" ? `${trend.value}%` : trend.value}
    </span>
  );
}

/**
 * Unified MetricCard component.
 *
 * Replaces StatCard, StatsCard, KpiCard, GlassCard.
 *
 * @example
 * <MetricCard label="Revenue" value="$328k" variant="gradient" gradientColor="blue" trend={{ value: 12, direction: "up" }} />
 * <MetricCard label="Claims" value={42} intent="success" icon={<Shield />} />
 * <MetricCard label="Leads" value="128" variant="glass" />
 */
export function MetricCard({
  label,
  value,
  icon,
  trend,
  variant = "default",
  gradientColor = "blue",
  intent = "default",
  description,
  className,
}: MetricCardProps) {
  // ─── Gradient ──────────────────────────────────────────────────
  if (variant === "gradient") {
    return (
      <div
        className={cn(
          "rounded-xl p-6 text-white shadow-lg transition hover:opacity-95",
          gradientTokens[gradientColor],
          className
        )}
      >
        {icon && <div className="mb-3">{icon}</div>}
        <div className="mb-1 text-sm font-medium opacity-90">{label}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">{value}</div>
          <TrendBadge trend={trend} light />
        </div>
        {description && <div className="mt-2 text-xs opacity-80">{description}</div>}
      </div>
    );
  }

  // ─── Solid ─────────────────────────────────────────────────────
  if (variant === "solid") {
    return (
      <div
        className={cn("rounded-xl p-6 text-white shadow-lg", solidColors[gradientColor], className)}
      >
        {icon && <div className="mb-3">{icon}</div>}
        <div className="mb-1 text-sm font-medium opacity-90">{label}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">{value}</div>
          <TrendBadge trend={trend} light />
        </div>
        {description && <div className="mt-2 text-xs opacity-80">{description}</div>}
      </div>
    );
  }

  // ─── Glass ─────────────────────────────────────────────────────
  if (variant === "glass") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "bg-white/10 backdrop-blur-xl",
          "border border-white/20",
          "shadow-xl shadow-black/5",
          "dark:border-slate-700/50 dark:bg-slate-900/40",
          "p-6 transition hover:shadow-2xl",
          className
        )}
      >
        {icon && <div className="mb-3">{icon}</div>}
        <div className="mb-1 text-sm font-medium text-slate-300">{label}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-semibold text-sky-300">{value}</div>
          <TrendBadge trend={trend} light />
        </div>
        {description && <div className="mt-2 text-xs text-slate-400">{description}</div>}
      </div>
    );
  }

  // ─── Outline ───────────────────────────────────────────────────
  if (variant === "outline") {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
          "dark:border-slate-700 dark:bg-slate-800/50",
          className
        )}
      >
        <div className="mb-2 flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                intentIconBg[intent]
              )}
            >
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200">{label}</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <TrendBadge trend={trend} />
        </div>
        {description && <div className="mt-2 text-xs text-muted-foreground">{description}</div>}
      </div>
    );
  }

  // ─── Default (shadcn Card) ─────────────────────────────────────
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        {icon && (
          <div
            className={cn(
              "mb-3 flex h-10 w-10 items-center justify-center rounded-lg",
              intentIconBg[intent]
            )}
          >
            {icon}
          </div>
        )}
        <div className="mb-1 text-sm font-medium text-muted-foreground">{label}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold text-foreground">{value}</div>
          <TrendBadge trend={trend} />
        </div>
        {description && <div className="mt-2 text-xs text-muted-foreground">{description}</div>}
      </CardContent>
    </Card>
  );
}

/** Backwards-compatible aliases */
export { MetricCard as StatCard };
export type { MetricCardProps as StatCardProps };

/* ------------------------------------------------------------------ */
/*  GlassContainer — simple glass-card wrapper for arbitrary children */
/* ------------------------------------------------------------------ */

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** A frosted-glass container panel (replaces old GlassCard wrapper usage). */
export function GlassContainer({ children, className }: GlassContainerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg",
        "dark:border-slate-700/40 dark:bg-slate-900/30",
        "shadow-lg transition",
        className
      )}
    >
      {children}
    </div>
  );
}

export default GlassContainer;
