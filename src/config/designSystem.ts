/**
 * ============================================================================
 * MASTER DESIGN SYSTEM — SkaiScraper Pro
 * ============================================================================
 *
 * Single source of truth for every visual token in the app.
 * Import from `@/config/designSystem` — never hard-code raw classes.
 *
 * Aesthetic: Premium SaaS — frosted glass, soft shadows, no black borders.
 *
 * ============================================================================
 */

/* ── Hero / Header Gradient ───────────────────────────────────────────────── */

/**
 * The single unified hero gradient used as the default across all sections.
 * Section themes in sectionThemes.ts override this per-route, but every
 * section stays in the blue-teal-indigo family for brand cohesion.
 */
export const HEADER_GRADIENT = "bg-gradient-to-r from-blue-600 via-teal-500 to-indigo-600";

/* ── Card Styles ──────────────────────────────────────────────────────────── */

/** Glass card — primary card style across the entire app */
export const CARD_GLASS =
  "rounded-2xl border border-white/20 bg-white/70 shadow-sm backdrop-blur-xl " +
  "dark:border-white/10 dark:bg-slate-900/60";

/** Solid card — for elevated / important surfaces */
export const CARD_SOLID =
  "rounded-2xl border border-slate-200/60 bg-white shadow-sm " +
  "dark:border-slate-700/50 dark:bg-slate-900";

/** Metric card — small KPI / stat box */
export const CARD_METRIC =
  "rounded-2xl border border-white/20 bg-white/60 p-6 shadow-sm backdrop-blur-xl " +
  "dark:border-white/10 dark:bg-slate-900/50";

/* ── Card Padding ─────────────────────────────────────────────────────────── */

export const CARD_PADDING = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

/* ── Section Spacing ──────────────────────────────────────────────────────── */

export const SECTION_GAP = "space-y-6";
export const GRID_GAP = "gap-4";

/* ── Page Container Widths ────────────────────────────────────────────────── */

export const PAGE_MAX_WIDTH = {
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
} as const;

/* ── Page Background ──────────────────────────────────────────────────────── */

export const PAGE_BG =
  "min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#f1f3f6] via-[#eef1f5] to-[#f1f3f6] " +
  "dark:from-slate-950 dark:via-slate-950 dark:to-slate-950";

/* ── Border Tokens ────────────────────────────────────────────────────────── */

/** Soft border — never black, always translucent */
export const BORDER = {
  default: "border-slate-200/60 dark:border-slate-700/50",
  subtle: "border-white/20 dark:border-white/10",
  divider: "border-slate-200/40 dark:border-slate-700/30",
} as const;

/* ── Typography ───────────────────────────────────────────────────────────── */

export const TEXT = {
  heading: "text-slate-900 dark:text-slate-50",
  body: "text-slate-700 dark:text-slate-300",
  muted: "text-slate-500 dark:text-slate-400",
  accent: "text-teal-600 dark:text-teal-400",
} as const;

/* ── Button Variants ──────────────────────────────────────────────────────── */

export const BTN = {
  primary:
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold " +
    "bg-teal-600 text-white shadow-sm hover:bg-teal-700 " +
    "dark:bg-teal-500 dark:hover:bg-teal-600 " +
    "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-teal-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold " +
    "bg-slate-100 text-slate-800 hover:bg-slate-200 " +
    "dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 " +
    "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-slate-400 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none",
  ghost:
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold " +
    "text-slate-600 hover:bg-slate-100 " +
    "dark:text-slate-300 dark:hover:bg-slate-800 " +
    "transition-colors disabled:opacity-50 disabled:pointer-events-none",
} as const;

/* ── Table Styles ─────────────────────────────────────────────────────────── */

export const TABLE = {
  wrapper:
    "overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl " +
    "dark:border-slate-700/50 dark:bg-slate-900/60",
  header:
    "border-b border-slate-200/40 text-left text-xs font-semibold uppercase tracking-wider " +
    "text-slate-500 dark:border-slate-700/30 dark:text-slate-400",
  headerCell: "px-6 py-3",
  body: "divide-y divide-slate-100/80 dark:divide-slate-700/30",
  row: "transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
  cell: "px-6 py-4 text-sm",
  empty: "px-6 py-12 text-center text-slate-500",
} as const;

/* ── Badge / Chip ─────────────────────────────────────────────────────────── */

export const BADGE = {
  success:
    "rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400",
  warning:
    "rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400",
  danger: "rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400",
  info: "rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400",
  neutral:
    "rounded-full bg-slate-500/15 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300",
} as const;

/* ── Loading / Skeleton ───────────────────────────────────────────────────── */

export const SKELETON = {
  base: "animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60",
  card: "h-32 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60",
  text: "h-4 animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/60",
} as const;

/* ── Shadows ──────────────────────────────────────────────────────────────── */

export const SHADOW = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  hero: "shadow-xl",
} as const;

/* ── Composite Helpers ────────────────────────────────────────────────────── */

/** Standard page section with glass card */
export function glassSection(extraClasses = "") {
  return `${CARD_GLASS} ${CARD_PADDING.md} ${extraClasses}`.trim();
}

/** Standard metric card with icon */
export function metricCard(extraClasses = "") {
  return `${CARD_METRIC} ${extraClasses}`.trim();
}
