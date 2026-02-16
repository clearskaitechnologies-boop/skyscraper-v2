/**
 * PHASE 7.2 → DESIGN SYSTEM ALIGNED
 * Shared utility classes — now backed by designSystem.ts tokens.
 * All border-slate-800 / border-slate-100 replaced with soft translucent borders.
 */

// Tesla-style bubble card — glass variant
export const bubbleCard =
  "rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm " +
  "dark:border-slate-700/50 dark:bg-slate-900/60";

// Form input style - no text cutoff
export const bubbleInput =
  "w-full rounded-xl px-4 py-3 text-sm sm:text-[15px] leading-relaxed " +
  "bg-slate-50 border border-slate-200/60 outline-none " +
  "focus:ring-2 focus:ring-teal-500 focus:border-teal-500 " +
  "dark:bg-slate-900 dark:border-slate-700/50 dark:text-slate-50 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500";

// Primary button — teal-centric, rounded-xl
export const primaryButton =
  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm " +
  "bg-teal-600 text-white hover:bg-teal-700 " +
  "dark:bg-teal-500 dark:hover:bg-teal-600 " +
  "transition-all focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-teal-500 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 " +
  "disabled:opacity-50 disabled:pointer-events-none hover:shadow-md";

// Secondary button
export const secondaryButton =
  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold " +
  "bg-slate-100 text-slate-800 hover:bg-slate-200 " +
  "dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-slate-400 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 " +
  "disabled:opacity-50 disabled:pointer-events-none";

// Unified page header
export const pageHeader = (title: string, subtitle?: string) => ({
  container: "mb-8",
  title: "text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white",
  subtitle: "mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400",
  titleText: title,
  subtitleText: subtitle || "",
});

// Textarea style - same as input but for multi-line
export const bubbleTextarea =
  "w-full rounded-xl px-4 py-3 text-sm sm:text-[15px] leading-relaxed " +
  "bg-slate-50 border border-slate-200/60 outline-none " +
  "focus:ring-2 focus:ring-teal-500 focus:border-teal-500 " +
  "dark:bg-slate-900 dark:border-slate-700/50 dark:text-slate-50 " +
  "placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none";

// Label style
export const formLabel = "block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2";

// Loading state component props
export const loadingCard =
  "rounded-2xl border border-slate-200/60 bg-white/80 shadow-sm p-8 " +
  "dark:border-slate-700/50 dark:bg-slate-900/60 backdrop-blur-sm " +
  "flex items-center justify-center min-h-[240px]";

// Error state component props
export const errorCard =
  "rounded-2xl border border-red-200/60 bg-red-50 shadow-sm p-6 " +
  "dark:border-red-900/50 dark:bg-red-950/20";
