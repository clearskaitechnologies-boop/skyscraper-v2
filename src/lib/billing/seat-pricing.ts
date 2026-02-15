/**
 * ═══════════════════════════════════════════════════════════════════════
 * SEAT-BASED PRICING — Single Source of Truth
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Model:  $80 / seat / month — flat, no tiers, no minimums, no discounts.
 * Range:  1–500 seats.
 * Stripe: One recurring Price with quantity = seatCount.
 * Proration: Stripe handles automatically on seat changes mid-cycle.
 */

// ── Constants ────────────────────────────────────────────────────────
export const PRICE_PER_SEAT_CENTS = 8000; // $80.00
export const PRICE_PER_SEAT_DOLLARS = 80;
export const MIN_SEATS = 1;
export const MAX_SEATS = 500;
export const CURRENCY = "usd";

// ── Helpers ──────────────────────────────────────────────────────────

/** Validate seat count is within allowed range */
export function validateSeatCount(seats: number): {
  valid: boolean;
  error?: string;
} {
  if (!Number.isInteger(seats)) {
    return { valid: false, error: "Seat count must be a whole number." };
  }
  if (seats < MIN_SEATS) {
    return { valid: false, error: `Minimum ${MIN_SEATS} seat required.` };
  }
  if (seats > MAX_SEATS) {
    return { valid: false, error: `Maximum ${MAX_SEATS} seats allowed.` };
  }
  return { valid: true };
}

/** Monthly total in cents */
export function monthlyCents(seats: number): number {
  return seats * PRICE_PER_SEAT_CENTS;
}

/** Monthly total formatted (e.g. "$240.00") */
export function monthlyFormatted(seats: number): string {
  return `$${(monthlyCents(seats) / 100).toFixed(2)}`;
}

/** Annual total formatted (e.g. "$2,880.00") */
export function annualFormatted(seats: number): string {
  const annual = monthlyCents(seats) * 12;
  return `$${(annual / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/** Summary object for UI display */
export function pricingSummary(seats: number) {
  const v = validateSeatCount(seats);
  if (!v.valid) return null;
  return {
    seats,
    pricePerSeat: PRICE_PER_SEAT_DOLLARS,
    monthlyTotal: monthlyCents(seats) / 100,
    monthlyFormatted: monthlyFormatted(seats),
    annualTotal: (monthlyCents(seats) * 12) / 100,
    annualFormatted: annualFormatted(seats),
  };
}
