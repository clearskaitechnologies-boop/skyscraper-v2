/**
 * Token Configuration
 * Defines costs for AI tools and quota limits
 */

export const TOKEN_COSTS = {
  AI_MOCKUP: 0, // Set to zero - no limits
  QUICK_DOL_PULL: 0, // Set to zero - no limits
  WEATHER_REPORT_BASIC: 0, // Set to zero - no limits
  WEATHER_REPORT_DETAILED: 0, // Set to zero - no limits
  BOX_SUMMARY_AI: 0, // Set to zero - no limits
  CARRIER_EXPORT_PDF: 0, // Free
  CARRIER_EXPORT_ZIP: 0, // Free
} as const;

export const TRIAL_TOKENS = 5; // Granted on trial start

export const TOKEN_PACKS = [
  {
    id: "starter",
    name: "Starter Pack",
    tokens: 10,
    price: 9.99,
    stripePriceId: process.env.NEXT_PUBLIC_TOKEN_PACK_STARTER_PRICE_ID || "",
  },
  {
    id: "pro",
    name: "Pro Pack",
    tokens: 50,
    price: 39.99,
    stripePriceId: process.env.NEXT_PUBLIC_TOKEN_PACK_PRO_PRICE_ID || "",
  },
  {
    id: "enterprise",
    name: "Enterprise Pack",
    tokens: 200,
    price: 149.99,
    stripePriceId: process.env.NEXT_PUBLIC_TOKEN_PACK_ENTERPRISE_PRICE_ID || "",
  },
] as const;

export const PLAN_QUOTAS = {
  SOLO: {
    aiMockups: 3,
    dolPulls: 3,
    weatherReports: 2,
    seats: 1,
  },
  BUSINESS: {
    aiMockups: 10,
    dolPulls: 10,
    weatherReports: 7, // per user
    seats: 10,
  },
  ENTERPRISE: {
    aiMockups: 25,
    dolPulls: 25,
    weatherReports: 15, // per user
    seats: 25,
  },
} as const;

export const OVERAGE_COSTS = {
  AI_MOCKUP: 0.99,
  DOL_PULL: 0.99,
  WEATHER_REPORT: 8.99,
} as const;
