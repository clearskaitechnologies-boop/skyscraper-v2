/**
 * Bubble Button UI System
 * Consistent button styles across the entire application
 */

// === UTILITY FUNCTIONS ===

/**
 * Classname concatenation utility
 * @param classes - Array of classnames (falsy values filtered out)
 * @returns Combined classname string
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Find first matching group key from pathname
 * @param pathname - Current pathname
 * @param groups - Array of group keys to match
 * @returns First matching group or "/dashboard"
 */
export function firstMatch(pathname: string, groups: string[]): string {
  return groups.find((g) => pathname === g || pathname.startsWith(g)) ?? "/dashboard";
}

// === BUBBLE BUTTONS (existing) ===

// Primary action button - bubble style
export const bubbleBtn =
  "px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

// Secondary outline button - bubble style
export const bubbleOutlineBtn =
  "px-5 py-2 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

// Success/positive action - bubble style
export const bubbleSuccessBtn =
  "px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-md transition-all duration-200 hover:scale-105 active:scale-95";

// Danger/destructive action - bubble style
export const bubbleDangerBtn =
  "px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-md transition-all duration-200 hover:scale-105 active:scale-95";

// Ghost/subtle button - bubble style
export const bubbleGhostBtn =
  "px-5 py-2 rounded-full hover:bg-gray-100 text-gray-700 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95";

// Large bubble button
export const bubbleBtnLg =
  "px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95";

// Small bubble button
export const bubbleBtnSm =
  "px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-all duration-200 hover:scale-105 active:scale-95";

// Icon button bubble
export const bubbleIconBtn =
  "p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center";

// Icon button outline
export const bubbleIconOutlineBtn =
  "p-2 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center";

/**
 * Usage Examples:
 *
 * import { bubbleBtn, bubbleOutlineBtn, bubbleSuccessBtn } from '@/lib/ui';
 *
 * <button className={bubbleBtn}>Save Changes</button>
 * <button className={bubbleOutlineBtn}>Cancel</button>
 * <button className={bubbleSuccessBtn}>Create Lead</button>
 */
