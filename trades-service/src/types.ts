// ============================================================================
// TRADES SERVICE TYPES
// Shared type definitions and constants for trades network
// ============================================================================

export const TRADE_TYPES = [
  "Roofing",
  "Siding",
  "Gutters",
  "Windows",
  "Doors",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Painting",
  "Flooring",
  "Drywall",
  "General Contractor",
  "Other",
] as const;

export type TradeType = (typeof TRADE_TYPES)[number];

export const URGENCY_LEVELS = ["low", "medium", "high", "urgent"] as const;

export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

export interface SearchFilters {
  tradeType?: string;
  zipCode?: string;
  radiusMiles?: number;
  minRating?: number;
  minJobs?: number;
  verified?: boolean;
}

export interface TradeProfileSummary {
  id: string;
  userId: string;
  tradeType: string;
  businessName: string;
  serviceRadiusMiles: number;
  acceptingNewClients: boolean;
  responseRatePct: number | null;
  avgRating: number | null;
  completedJobs: number;
  yearsInBusiness: number;
  distance?: number;
}
