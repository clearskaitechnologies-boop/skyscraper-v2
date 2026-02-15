// ============================================================================
// TYPESCRIPT TYPES FOR TRADES MICROSERVICE
// ============================================================================

export const TRADE_TYPES = [
  "roofing",
  "plumbing",
  "hvac",
  "electrical",
  "carpentry",
  "painting",
  "flooring",
  "drywall",
  "siding",
  "windows",
  "doors",
  "landscaping",
  "fencing",
  "concrete",
  "masonry",
  "general_contractor",
  "handyman",
  "other",
] as const;

export type TradeType = (typeof TRADE_TYPES)[number];

export const URGENCY_LEVELS = ["emergency", "urgent", "normal", "flexible"] as const;
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number];

export const CONNECTION_STATUSES = ["pending", "accepted", "declined", "expired"] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export interface PortfolioItem {
  url: string;
  caption?: string;
  type: "image" | "video";
  uploadedAt?: string;
}

export interface Certification {
  name: string;
  url?: string;
  expiresAt?: string;
}

export interface TradeProfileData {
  clerkUserId: string;
  companyName?: string;
  tradeType: TradeType;
  specialties?: string[];
  bio?: string;
  portfolio?: PortfolioItem[];
  licenseNumber?: string;
  insured: boolean;
  yearsExperience?: number;
  certifications?: Certification[];
  baseZip?: string;
  radiusMiles: number;
  serviceZips?: string[];
  acceptingClients: boolean;
  emergencyService: boolean;
}

export interface SearchFilters {
  zip: string;
  radiusMiles?: number;
  tradeType?: TradeType;
  minRating?: number;
  emergencyOnly?: boolean;
  insuredOnly?: boolean;
}

export interface SearchResult {
  profile: {
    id: string;
    clerkUserId: string;
    companyName?: string;
    tradeType: string;
    specialties?: string[];
    bio?: string;
    portfolio?: PortfolioItem[];
    licenseNumber?: string;
    insured: boolean;
    yearsExperience?: number;
    avgRating: number;
    reviewCount: number;
    completedJobs: number;
    responseRate: number;
    acceptingClients: boolean;
    emergencyService: boolean;
  };
  distance: number;
  score: number;
}

export interface ConnectionRequest {
  clientClerkId: string;
  proClerkId: string;
  serviceType?: string;
  urgency?: UrgencyLevel;
  notes?: string;
}

export interface ReviewData {
  proClerkId: string;
  clientClerkId: string;
  rating: number;
  comment?: string;
  jobType?: string;
  jobCompleted: boolean;
}
