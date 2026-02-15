/**
 * Money utilities for financial calculations and formatting
 * All amounts are stored in cents to avoid floating point errors
 */

/**
 * Format cents as currency string
 * @param cents - Amount in cents (e.g., 12500 = $125.00)
 * @returns Formatted currency string (e.g., "$125.00")
 */
export const money = (cents?: number) =>
  `$${((cents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

/**
 * Sum an array of cent values
 * @param values - Array of amounts in cents
 * @returns Total sum in cents
 */
export function sumCents(values: number[]): number {
  return values.reduce((a, b) => a + (b || 0), 0);
}

/**
 * Parse currency string to cents
 * @param value - Currency string (e.g., "$125.00", "125", "125.50")
 * @returns Amount in cents
 */
export function parseMoney(value: string): number {
  const cleaned = value.replace(/[$,]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

/**
 * Format cents as compact currency (e.g., "$1.2K", "$3.5M")
 * @param cents - Amount in cents
 * @returns Compact currency string
 */
export function moneyCompact(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(1)}M`;
  }
  if (dollars >= 1_000) {
    return `$${(dollars / 1_000).toFixed(1)}K`;
  }
  return money(cents);
}

