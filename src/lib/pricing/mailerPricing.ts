/**
 * Mailer Pricing
 * Unit pricing + calculations for print mail fulfillment
 */

// Base unit price (what we charge contractors)
export const MAILER_UNIT_PRICE = 2.25;

// Cost breakdown (for reference)
// Lob postcard cost: ~$0.75
// Our margin: ~$1.50 per mailer
// Volume discounts could be added here later

export interface MailerPricingCalculation {
  quantity: number;
  unitPrice: number;
  subtotal: number;
  total: number;
  margin: number;
}

export function calculateMailerTotal(quantity: number): MailerPricingCalculation {
  const unitPrice = MAILER_UNIT_PRICE;
  const subtotal = quantity * unitPrice;
  const total = subtotal;
  const margin = quantity * 1.5; // Approximate margin

  return {
    quantity,
    unitPrice: Number(unitPrice.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    total: Number(total.toFixed(2)),
    margin: Number(margin.toFixed(2)),
  };
}

// Volume pricing tiers (future enhancement)
export function getVolumeDiscount(quantity: number): number {
  if (quantity >= 500) return 0.25; // $0.25 off per mailer
  if (quantity >= 250) return 0.15;
  if (quantity >= 100) return 0.10;
  return 0;
}
