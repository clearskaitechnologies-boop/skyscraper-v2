/**
 * PortalPageHero — Shared gradient hero banner for client portal pages.
 *
 * Replaces the duplicated hero pattern across 7+ portal pages.
 * Provides a consistent, polished look with gradient backgrounds,
 * glass-morphism accents, icon badges, and stat strips.
 *
 * Colors are aligned with the Master Section Color System
 * in src/config/sectionThemes.ts.
 */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

interface Stat {
  label: string;
  value: string | number;
}

interface PortalPageHeroProps {
  /** Page title (h1) */
  title: string;
  /** Subtitle / description text */
  subtitle?: string;
  /** Lucide icon component for the badge */
  icon?: LucideIcon;
  /** Badge label text next to the icon */
  badge?: string;
  /** Gradient color scheme — aligned with sectionThemes.ts */
  gradient?:
    | "violet"
    | "emerald"
    | "blue"
    | "orange"
    | "amber"
    | "purple"
    | "rose"
    | "indigo"
    | "teal"
    | "cyan";
  /** Optional stat strip below the title */
  stats?: Stat[];
  /** Optional action button (right side) */
  action?: ReactNode;
  /** Optional children below the main content */
  children?: ReactNode;
}

const gradients: Record<string, { bg: string; accent: string; textMuted: string }> = {
  // Aligned with SECTION_THEMES from src/config/sectionThemes.ts
  blue: {
    bg: "from-blue-600 via-blue-700 to-indigo-700", // command
    accent: "bg-blue-400/20",
    textMuted: "text-blue-100",
  },
  teal: {
    bg: "from-teal-500 via-teal-600 to-cyan-600", // jobs
    accent: "bg-teal-400/20",
    textMuted: "text-teal-100",
  },
  cyan: {
    bg: "from-cyan-500 via-teal-500 to-sky-600", // claims
    accent: "bg-cyan-400/20",
    textMuted: "text-cyan-100",
  },
  orange: {
    bg: "from-orange-500 via-orange-600 to-amber-600", // trades
    accent: "bg-orange-400/20",
    textMuted: "text-orange-100",
  },
  violet: {
    bg: "from-violet-600 via-purple-600 to-purple-700", // reports
    accent: "bg-violet-400/20",
    textMuted: "text-violet-100",
  },
  indigo: {
    bg: "from-indigo-500 via-indigo-600 to-blue-600", // network
    accent: "bg-indigo-400/20",
    textMuted: "text-indigo-100",
  },
  emerald: {
    bg: "from-emerald-500 via-emerald-600 to-green-700", // finance
    accent: "bg-emerald-400/20",
    textMuted: "text-emerald-100",
  },
  // Legacy aliases (kept for backward compat)
  amber: {
    bg: "from-orange-500 via-orange-600 to-amber-600",
    accent: "bg-amber-400/20",
    textMuted: "text-amber-100",
  },
  purple: {
    bg: "from-violet-600 via-purple-600 to-purple-700",
    accent: "bg-purple-400/20",
    textMuted: "text-purple-100",
  },
  rose: {
    bg: "from-rose-600 via-pink-600 to-fuchsia-700",
    accent: "bg-rose-400/20",
    textMuted: "text-rose-100",
  },
};

export default function PortalPageHero({
  title,
  subtitle,
  icon: Icon,
  badge,
  gradient = "violet",
  stats,
  action,
  children,
}: PortalPageHeroProps) {
  const g = gradients[gradient] ?? gradients.violet;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${g.bg} p-8 text-white shadow-2xl md:p-12`}
    >
      {/* Decorative blurs */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className={`absolute -bottom-20 -left-20 h-64 w-64 rounded-full ${g.accent} blur-3xl`} />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          {/* Icon + Badge */}
          {(Icon || badge) && (
            <div className="mb-4 flex items-center gap-2">
              {Icon && (
                <div className="rounded-full bg-white/20 p-2">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              {badge && (
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  {badge}
                </Badge>
              )}
            </div>
          )}

          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          {subtitle && <p className={`text-lg ${g.textMuted}`}>{subtitle}</p>}
        </div>

        {action}
      </div>

      {/* Stats strip */}
      {stats && stats.length > 0 && (
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-white/20 pt-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold md:text-3xl">{stat.value}</p>
              <p className={`text-sm ${g.textMuted}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
