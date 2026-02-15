/**
 * Profile Strength Banner
 * Reusable component for both pro trades and client portal sides.
 * Shows a color-coded progress bar with missing-field hints and a CTA.
 */

"use client";

import { AlertTriangle, Award, CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

// Re-export from shared server-safe utility so existing client imports still work
export { calculateClientStrength, calculateProStrength } from "@/lib/profile-strength";

interface ProfileStrengthBannerProps {
  /** 0 – 100 */
  percent: number;
  missing: string[];
  editHref: string;
  variant?: "pro" | "client";
}

function getLabel(p: number) {
  if (p >= 95) return { text: "All-Star ⭐", icon: Award, color: "emerald" } as const;
  if (p >= 75) return { text: "Strong", icon: TrendingUp, color: "blue" } as const;
  if (p >= 50) return { text: "Good Start", icon: Sparkles, color: "amber" } as const;
  if (p >= 25) return { text: "Needs Work", icon: AlertTriangle, color: "orange" } as const;
  return { text: "Just Getting Started", icon: AlertTriangle, color: "red" } as const;
}

const colorMap: Record<string, { bg: string; bar: string; text: string; badge: string }> = {
  emerald: {
    bg: "bg-emerald-50 border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-700/40",
    bar: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  blue: {
    bg: "bg-blue-50 border-blue-200/60 dark:bg-blue-950/40 dark:border-blue-700/40",
    bar: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  amber: {
    bg: "bg-amber-50 border-amber-200/60 dark:bg-amber-950/40 dark:border-amber-700/40",
    bar: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  orange: {
    bg: "bg-orange-50 border-orange-200/60 dark:bg-orange-950/40 dark:border-orange-700/40",
    bar: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-300",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  red: {
    bg: "bg-red-50 border-red-200/60 dark:bg-red-950/40 dark:border-red-700/40",
    bar: "bg-red-500",
    text: "text-red-700 dark:text-red-300",
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

export default function ProfileStrengthBanner({
  percent,
  missing,
  editHref,
  variant = "pro",
}: ProfileStrengthBannerProps) {
  if (percent >= 95) return null; // All-star profiles don't need the nudge

  const { text, icon: Icon, color } = getLabel(percent);
  const c = colorMap[color] || colorMap.amber;

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${c.bg}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: icon + copy */}
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2.5 ${c.badge}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${c.text}`}>Profile Strength: {percent}%</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${c.badge}`}
              >
                {text}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
              {variant === "pro"
                ? "Complete your profile so contractors and clients can find & trust you."
                : "Fill in more details so contractors understand your needs."}
            </p>
            {missing.length > 0 && (
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">Missing:</span> {missing.slice(0, 4).join(", ")}
                {missing.length > 4 && ` (+${missing.length - 4} more)`}
              </p>
            )}
          </div>
        </div>

        {/* Right: bar + CTA */}
        <div className="flex items-center gap-4">
          {/* Mini progress */}
          <div className="hidden w-28 flex-col items-end sm:flex">
            <span className={`text-lg font-bold ${c.text}`}>{percent}%</span>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <Link
            href={editHref}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
