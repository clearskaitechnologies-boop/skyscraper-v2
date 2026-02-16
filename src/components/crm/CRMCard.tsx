// Unified CRM Card Component - SKAIUX GLASS V5
// Phase G Priority 2: CRM Layout Unification
// Consistent glass panel design across all CRM pages

import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CRMCardProps {
  children: ReactNode;
  variant?: "glass" | "solid" | "gradient";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  noPadding?: boolean;
}

const variants = {
  glass:
    "rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60",
  solid:
    "rounded-2xl border border-slate-200/60 bg-white dark:border-slate-700/50 dark:bg-slate-900",
  gradient:
    "rounded-2xl border border-slate-200/20 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_0_30px_-12px_rgba(0,0,0,0.25)]",
};

const sizes = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

export function CRMCard({
  children,
  variant = "glass",
  size = "md",
  className,
  noPadding = false,
}: CRMCardProps) {
  return (
    <div
      className={cn(
        variants[variant],
        !noPadding && sizes[size],
        "shadow-[0_0_30px_-12px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      {children}
    </div>
  );
}

// Section Header Component
interface CRMSectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CRMSectionHeader({ title, description, action }: CRMSectionHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Stats Card Component
interface CRMStatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color?: "blue" | "emerald" | "amber" | "red" | "purple" | "slate";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

export function CRMStatsCard({
  icon: Icon,
  label,
  value,
  color = "blue",
  trend,
}: CRMStatsCardProps) {
  return (
    <CRMCard>
      <div className="flex items-center gap-3">
        <div className={cn("rounded-xl p-3", colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </CRMCard>
  );
}
