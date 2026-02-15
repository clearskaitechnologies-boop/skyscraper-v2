/**
 * Raven UI - Input Styles
 * Single source of truth for all input, textarea, and select styling
 * Ensures light/dark mode compatibility with readable text
 */

export const inputBase =
  "w-full rounded-md bg-white text-slate-900 placeholder:text-slate-400 " +
  "border border-slate-200 shadow-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
  "disabled:bg-slate-50 disabled:text-slate-400 " +
  "dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500";

export const textareaBase =
  "w-full rounded-md bg-white text-slate-900 placeholder:text-slate-400 " +
  "border border-slate-200 shadow-sm resize-none " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
  "disabled:bg-slate-50 disabled:text-slate-400 " +
  "dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:placeholder:text-slate-500";

export const selectBase =
  "w-full rounded-md bg-white text-slate-900 " +
  "border border-slate-200 shadow-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
  "disabled:bg-slate-50 disabled:text-slate-400 " +
  "dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700";

export const buttonGhostLight =
  "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 " +
  "dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700";
