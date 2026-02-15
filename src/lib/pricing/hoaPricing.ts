/**
 * HOA Tier Pricing
 * Enterprise community-level pricing
 */

export interface HoaPricingTier {
  minHomes: number;
  maxHomes: number | null;
  price: number;
  label: string;
}

export const HOA_PRICING_TIERS: HoaPricingTier[] = [
  {
    minHomes: 1,
    maxHomes: 100,
    price: 2500,
    label: '≤100 homes',
  },
  {
    minHomes: 101,
    maxHomes: 300,
    price: 5000,
    label: '100-300 homes',
  },
  {
    minHomes: 301,
    maxHomes: 700,
    price: 10000,
    label: '300-700 homes',
  },
  {
    minHomes: 701,
    maxHomes: null,
    price: 0, // Custom pricing
    label: '700+ homes',
  },
];

export function calculateHoaPrice(homeCount: number): {
  price: number;
  tier: HoaPricingTier;
  isCustom: boolean;
} {
  const tier = HOA_PRICING_TIERS.find(
    t => homeCount >= t.minHomes && (t.maxHomes === null || homeCount <= t.maxHomes)
  );

  if (!tier || tier.price === 0) {
    return {
      price: 0,
      tier: tier || HOA_PRICING_TIERS[HOA_PRICING_TIERS.length - 1],
      isCustom: true,
    };
  }

  return {
    price: tier.price,
    tier,
    isCustom: false,
  };
}

// Subscription pricing (optional recurring)
export const HOA_SUBSCRIPTION_TIERS = [
  {
    minHomes: 1,
    maxHomes: 100,
    monthly: 250,
    label: '≤100 homes',
  },
  {
    minHomes: 101,
    maxHomes: 300,
    monthly: 500,
    label: '100-300 homes',
  },
  {
    minHomes: 301,
    maxHomes: 700,
    monthly: 750,
    label: '300-700 homes',
  },
];

export function calculateHoaSubscription(homeCount: number): {
  monthly: number;
  annual: number;
  savings: number;
} {
  const tier = HOA_SUBSCRIPTION_TIERS.find(
    t => homeCount >= t.minHomes && (t.maxHomes === null || homeCount <= t.maxHomes)
  );

  const monthly = tier?.monthly || 0;
  const annual = monthly * 10; // 2 months free
  const savings = monthly * 2;

  return {
    monthly,
    annual,
    savings,
  };
}
