/**
 * PHASE 7.2 — Tesla/Apple Clean Design Tokens
 * Shared utility classes for consistent visual language across the app
 */

// Tesla-style bubble card
export const bubbleCard =
  "rounded-3xl border border-slate-100 bg-white shadow-sm " +
  "dark:border-slate-800 dark:bg-slate-900/70 backdrop-blur-sm";

// Form input style - no text cutoff
export const bubbleInput =
  "w-full rounded-2xl px-4 py-3 text-sm sm:text-[15px] leading-relaxed " +
  "bg-slate-50 border border-slate-200 outline-none " +
  "focus:ring-2 focus:ring-sky-500 focus:border-sky-500 " +
  "dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500";

// Primary button - highly visible in both themes with strong contrast and shadow
export const primaryButton =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium shadow-md " +
  "bg-slate-900 text-white hover:bg-slate-800 " +
  "dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 " +
  "transition-all focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-sky-500 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 " +
  "disabled:opacity-50 disabled:pointer-events-none hover:shadow-lg";

// Secondary button
export const secondaryButton =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium " +
  "bg-slate-100 text-slate-900 hover:bg-slate-200 " +
  "dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-sky-500 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 " +
  "disabled:opacity-50 disabled:pointer-events-none";

// Unified page header
export const pageHeader = (title: string, subtitle?: string) => ({
  container: "mb-8",
  title:
    "text-3xl sm:text-4xl font-semibold tracking-tight bg-gradient-to-r from-sky-500 to-amber-400 bg-clip-text text-transparent",
  subtitle: "mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400",
  titleText: title,
  subtitleText: subtitle || "",
});

// Textarea style - same as input but for multi-line
export const bubbleTextarea =
  "w-full rounded-2xl px-4 py-3 text-sm sm:text-[15px] leading-relaxed " +
  "bg-slate-50 border border-slate-200 outline-none " +
  "focus:ring-2 focus:ring-sky-500 focus:border-sky-500 " +
  "dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none";

// Label style
export const formLabel = "block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2";

// Loading state component props
export const loadingCard =
  "rounded-3xl border border-slate-100 bg-white shadow-sm p-8 " +
  "dark:border-slate-800 dark:bg-slate-900/70 backdrop-blur-sm " +
  "flex items-center justify-center min-h-[240px]";

// Error state component props
export const errorCard =
  "rounded-3xl border border-red-100 bg-red-50 shadow-sm p-6 " +
  "dark:border-red-900/50 dark:bg-red-950/20";
