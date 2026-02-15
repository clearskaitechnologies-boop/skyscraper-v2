// ============================================================================
// TRADES SERVICE CLIENT
// Used by SkaiScraper Core to make authenticated requests to trades microservice
// ============================================================================

import jwt from "jsonwebtoken";

const TRADES_SERVICE_URL = process.env.TRADES_SERVICE_URL || "https://trades.skaiscrape.com";
const SERVICE_TOKEN_SECRET = process.env.SERVICE_TOKEN_SECRET || "dev-secret-change-in-production";

interface ServiceTokenPayload {
  service: "skaiscrape-core";
  clerkUserId?: string;
  role?: "client" | "pro" | "admin";
}

/**
 * Generate JWT service token for trades microservice requests
 */
function generateServiceToken(clerkUserId: string, role: "client" | "pro" | "admin"): string {
  const payload: ServiceTokenPayload = {
    service: "skaiscrape-core",
    clerkUserId,
    role,
  };

  return jwt.sign(payload, SERVICE_TOKEN_SECRET, { expiresIn: "1h" });
}

/**
 * Make authenticated request to trades microservice
 */
async function tradesServiceFetch<T>(
  endpoint: string,
  clerkUserId: string,
  role: "client" | "pro" | "admin",
  options?: RequestInit
): Promise<T> {
  const token = generateServiceToken(clerkUserId, role);

  const response = await fetch(`${TRADES_SERVICE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Trades service request failed: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// PROFILE METHODS
// ============================================================================

export async function createTradeProfile(
  clerkUserId: string,
  data: {
    companyName?: string;
    tradeType: string;
    specialties?: string[];
    bio?: string;
    portfolio?: Array<{ url: string; caption?: string; type: "image" | "video" }>;
    licenseNumber?: string;
    insured: boolean;
    yearsExperience?: number;
    certifications?: Array<{ name: string; url?: string; expiresAt?: string }>;
    baseZip?: string;
    radiusMiles: number;
    serviceZips?: string[];
    acceptingClients: boolean;
    emergencyService: boolean;
  }
) {
  return tradesServiceFetch("/api/profile", clerkUserId, "pro", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getTradeProfile(clerkUserId: string) {
  return tradesServiceFetch(`/api/profile?clerkUserId=${clerkUserId}`, clerkUserId, "pro", {
    method: "GET",
  });
}

export async function updateTradeProfile(clerkUserId: string, data: Record<string, any>) {
  return tradesServiceFetch("/api/profile", clerkUserId, "pro", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// SEARCH METHODS
// ============================================================================

export async function searchPros(
  clerkUserId: string,
  filters: {
    zip: string;
    radiusMiles?: number;
    tradeType?: string;
    minRating?: number;
    emergencyOnly?: boolean;
    insuredOnly?: boolean;
    limit?: number;
  }
) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });

  return tradesServiceFetch(`/api/search?${params.toString()}`, clerkUserId, "client", {
    method: "GET",
  });
}

// ============================================================================
// CONNECTION METHODS
// ============================================================================

export async function requestConnection(
  clerkUserId: string,
  data: {
    proClerkId: string;
    serviceType?: string;
    urgency?: "emergency" | "urgent" | "normal" | "flexible";
    notes?: string;
  }
) {
  return tradesServiceFetch("/api/connect", clerkUserId, "client", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getConnections(
  clerkUserId: string,
  role: "client" | "pro",
  status?: "pending" | "accepted" | "declined"
) {
  const params = new URLSearchParams({ role });
  if (status) params.append("status", status);

  return tradesServiceFetch(`/api/connect?${params.toString()}`, clerkUserId, role, {
    method: "GET",
  });
}

export async function respondToConnection(
  clerkUserId: string,
  data: {
    connectionId: string;
    accept: boolean;
    message?: string;
    coreLeadId?: string;
    coreClaimId?: string;
  }
) {
  return tradesServiceFetch("/api/connect/respond", clerkUserId, "pro", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// REVIEW METHODS
// ============================================================================

export async function submitReview(
  clerkUserId: string,
  data: {
    proClerkId: string;
    rating: number;
    comment?: string;
    jobType?: string;
    jobCompleted: boolean;
  }
) {
  return tradesServiceFetch("/api/reviews", clerkUserId, "client", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getReviews(clerkUserId: string, proClerkId: string) {
  return tradesServiceFetch(`/api/reviews?proClerkId=${proClerkId}`, clerkUserId, "client", {
    method: "GET",
  });
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function checkTradesServiceHealth() {
  try {
    const response = await fetch(`${TRADES_SERVICE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
