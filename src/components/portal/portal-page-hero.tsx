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
  // UNIFIED TEAL/TURQUOISE — all portal pages use the same brand color
  blue: {
    bg: "from-teal-600 via-teal-600 to-cyan-600",
    accent: "bg-teal-400/20",
    textMuted: "text-teal-100",
  },
  teal: {
    bg: "from-teal-600 via-teal-600 to-cyan-600",
    accent: "bg-teal-400/20",
    textMuted: "text-teal-100",
  },
  cyan: {
    bg: "from-teal-600 via-teal-600 to-cyan-600",
    accent: "bg-teal-400/20",
    textMuted: "text-teal-100",
  },
  orange: {
    bg: "from-teal-600 via-teal-600 to-cyan-600",
    accent: "bg-teal-400/20",
    textMuted: "text-teal-100",
  },
  violet: {
    bg: "from-teal-600 via-teal-600 to-cyan-600",
    accent: "bg-teal-400/20",
    textMuted: "text-teal-100",
  },
  indigo: {
    bg: "from-teal-600 via-teal-600 to-cyan-600",
    accent: "bg-teal-400/20",
    textMuted: "text-teal-100",
  },
  emerald: {
    bg: "from-teal-600 via-teal-600 to-cyan-600",
    accent: "bg-teal-400/20",
    textMuted: "text-teal-100",
  },
  amber: {
    bg: "from-teal-600 via-teal-600 to-cyan-600",
    accent: "bg-teal-400/20",
    textMuted: "text-teal-100",
  },
  purple: {
    bg: "from-teal-600 via-teal-600 to-cyan-600",
    accent: "bg-teal-400/20",
    textMuted: "text-teal-100",
  },
  rose: {
    bg: "from-teal-600 via-teal-600 to-cyan-600",
    accent: "bg-teal-400/20",
    textMuted: "text-teal-100",
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
