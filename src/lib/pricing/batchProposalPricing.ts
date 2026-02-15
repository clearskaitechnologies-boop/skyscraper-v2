/**
 * Batch Proposal Pricing Engine
 *
 * Pricing Rules:
 * - Base price: $20 per home
 * - Discount: $1 per 100 homes ordered
 * - Max discount: $5 total
 * - Floor price: $15 per home
 */

const BASE_PRICE = 20;
const DISCOUNT_PER_100 = 1;
const MAX_DISCOUNT = 5;
const FLOOR_PRICE = 15;

export interface PricingBreakdown {
  homeCount: number;
  pricePerHome: number;
  totalPrice: number;
  discount: number;
  savings: number;
  tier: number;
}

/**
 * Calculate price per home based on volume
 * Rule: $1 discount per 100 homes, max $5 discount
 */
export function calculatePricePerHome(homeCount: number): number {
  if (homeCount <= 0) return BASE_PRICE;

  const discountSteps = Math.floor(homeCount / 100);
  const discount = Math.min(discountSteps * DISCOUNT_PER_100, MAX_DISCOUNT);
  const pricePerHome = BASE_PRICE - discount;

  return Math.max(pricePerHome, FLOOR_PRICE);
}

/**
 * Calculate total price for batch
 */
export function calculateTotalPrice(homeCount: number): number {
  return calculatePricePerHome(homeCount) * homeCount;
}

/**
 * Get full pricing breakdown with savings info
 */
export function getPricingBreakdown(homeCount: number): PricingBreakdown {
  const pricePerHome = calculatePricePerHome(homeCount);
  const totalPrice = calculateTotalPrice(homeCount);
  const discount = BASE_PRICE - pricePerHome;
  const savings = discount * homeCount;
  const tier = Math.min(Math.floor(homeCount / 100), 5);

  return {
    homeCount,
    pricePerHome,
    totalPrice,
    discount,
    savings,
    tier,
  };
}

/**
 * Get pricing tiers for display
 */
export function getPricingTiers() {
  return [
    { homes: 25, pricePerHome: 20, total: 500, tier: 0 },
    { homes: 50, pricePerHome: 20, total: 1000, tier: 0 },
    { homes: 100, pricePerHome: 19, total: 1900, tier: 1 },
    { homes: 200, pricePerHome: 18, total: 3600, tier: 2 },
    { homes: 300, pricePerHome: 17, total: 5100, tier: 3 },
    { homes: 500, pricePerHome: 15, total: 7500, tier: 5 },
  ];
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format price per home for display
 */
export function formatPricePerHome(pricePerHome: number): string {
  return `$${pricePerHome}`;
}
