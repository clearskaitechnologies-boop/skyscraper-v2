import { TrendingDown,TrendingUp } from "lucide-react";
import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardGradient =
  | "primary"
  | "blue"
  | "purple"
  | "indigo"
  | "cyan"
  | "success"
  | "error"
  | "warning";

export interface StatCardProps {
  /** Main label for the stat */
  label: string;
  /** The main value to display */
  value: string | number;
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Optional trend data */
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  /** Visual variant */
  variant?: "default" | "gradient" | "solid";
  /** Gradient color scheme using design tokens */
  gradientColor?: StatCardGradient;
  /** Description text below value */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StatCard - Unified statistics/metrics display component
 *
 * Usage:
 * <StatCard label="Total Revenue" value="$328,450" variant="default" />
 * <StatCard
 *   label="Active Claims"
 *   value={42}
 *   variant="gradient"
 *   gradientColor="blue"
 *   trend={{ value: 12, direction: "up" }}
 * />
 */
export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "default",
  gradientColor = "blue",
  description,
  className,
}: StatCardProps) {
  // Gradient design tokens mapping
  const gradientTokens: Record<StatCardGradient, string> = {
    primary: "bg-gradient-primary",
    blue: "bg-gradient-blue",
    purple: "bg-gradient-purple",
    indigo: "bg-gradient-indigo",
    cyan: "bg-gradient-cyan",
    success: "bg-gradient-success",
    error: "bg-gradient-error",
    warning: "bg-gradient-warning",
  };

  // Solid color mapping
  const solidColors: Record<StatCardGradient, string> = {
    primary: "bg-blue-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    indigo: "bg-indigo-500",
    cyan: "bg-cyan-500",
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-orange-500",
  };

  if (variant === "gradient") {
    return (
      <div
        className={cn(
          "rounded-lg p-6 text-white shadow transition hover:opacity-95",
          gradientTokens[gradientColor],
          className
        )}
      >
        {icon && <div className="mb-3">{icon}</div>}
        <div className="mb-1 text-sm font-medium opacity-90">{label}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">{value}</div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                trend.direction === "up" ? "text-white" : "text-white/80"
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </div>
          )}
        </div>
        {description && <div className="mt-2 text-xs opacity-80">{description}</div>}
      </div>
    );
  }

  if (variant === "solid") {
    return (
      <div
        className={cn("rounded-lg p-6 text-white shadow", solidColors[gradientColor], className)}
      >
        {icon && <div className="mb-3">{icon}</div>}
        <div className="mb-1 text-sm font-medium opacity-90">{label}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">{value}</div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                trend.direction === "up" ? "text-white" : "text-white/80"
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </div>
          )}
        </div>
        {description && <div className="mt-2 text-xs opacity-80">{description}</div>}
      </div>
    );
  }

  // Default variant (uses Card component)
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
        <div className="mb-1 text-sm font-medium text-muted-foreground">{label}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold text-foreground">{value}</div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                trend.direction === "up" ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </div>
          )}
        </div>
        {description && <div className="mt-2 text-xs text-muted-foreground">{description}</div>}
      </CardContent>
    </Card>
  );
}
