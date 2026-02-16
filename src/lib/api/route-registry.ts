/**
 * API Route Registry & Governance
 *
 * Centralized metadata for all API routes including:
 * - Domain categorization
 * - Rate limit presets
 * - Auth requirements
 * - Deprecation status
 *
 * Used by:
 * - OpenAPI spec generation
 * - Rate limit middleware
 * - Route auditing
 * - Documentation generation
 */

// ============================================================================
// Route Categories
// ============================================================================

export type ApiDomain =
  | "claims"
  | "reports"
  | "portal"
  | "trades"
  | "billing"
  | "ai"
  | "auth"
  | "admin"
  | "integrations"
  | "migrations"
  | "webhooks"
  | "health"
  | "legacy";

export type AuthLevel = "public" | "authenticated" | "org-member" | "admin" | "internal";

export type RateLimitPreset =
  | "AI"
  | "UPLOAD"
  | "WEATHER"
  | "API"
  | "WEBHOOK"
  | "PUBLIC"
  | "AUTH"
  | "MIGRATION"
  | "API_KEYS";

// ============================================================================
// Route Metadata
// ============================================================================

export interface RouteMetadata {
  path: string;
  methods: ("GET" | "POST" | "PUT" | "PATCH" | "DELETE")[];
  domain: ApiDomain;
  authLevel: AuthLevel;
  rateLimit: RateLimitPreset;
  deprecated?: boolean;
  deprecatedBy?: string;
  description?: string;
  version?: "v1" | "v2";
}

// ============================================================================
// Route Registry
// ============================================================================

export const API_ROUTE_REGISTRY: RouteMetadata[] = [
  // ── Claims Domain ────────────────────────────────────────────────────────
  {
    path: "/api/claims",
    methods: ["GET", "POST"],
    domain: "claims",
    authLevel: "org-member",
    rateLimit: "API",
    description: "List and create claims",
  },
  {
    path: "/api/claims/[claimId]",
    methods: ["GET", "PATCH", "DELETE"],
    domain: "claims",
    authLevel: "org-member",
    rateLimit: "API",
    description: "Single claim operations",
  },
  {
    path: "/api/claims/[claimId]/ai/actions",
    methods: ["POST"],
    domain: "ai",
    authLevel: "org-member",
    rateLimit: "AI",
    description: "AI operations on claims (scope, damage, dispute)",
  },
  {
    path: "/api/claims/[claimId]/final-payout/actions",
    methods: ["POST"],
    domain: "claims",
    authLevel: "org-member",
    rateLimit: "API",
    description: "Final payout calculations",
  },

  // ── Reports Domain ───────────────────────────────────────────────────────
  {
    path: "/api/reports",
    methods: ["GET"],
    domain: "reports",
    authLevel: "org-member",
    rateLimit: "API",
    description: "List reports",
  },
  {
    path: "/api/reports/actions",
    methods: ["POST"],
    domain: "reports",
    authLevel: "org-member",
    rateLimit: "API",
    description: "Batch report operations",
  },
  {
    path: "/api/reports/[reportId]/actions",
    methods: ["POST"],
    domain: "reports",
    authLevel: "org-member",
    rateLimit: "API",
    description: "Single report operations (send, approve, reject)",
  },
  {
    path: "/api/reports/generate",
    methods: ["POST"],
    domain: "reports",
    authLevel: "org-member",
    rateLimit: "AI",
    description: "Generate report (AI-heavy)",
  },

  // ── Portal Domain ────────────────────────────────────────────────────────
  {
    path: "/api/portal/claims/[claimId]/actions",
    methods: ["POST"],
    domain: "portal",
    authLevel: "authenticated",
    rateLimit: "API",
    description: "Client portal claim operations",
  },
  {
    path: "/api/portal/jobs/[jobId]/actions",
    methods: ["POST"],
    domain: "portal",
    authLevel: "authenticated",
    rateLimit: "API",
    description: "Client portal job operations",
  },
  {
    path: "/api/portal/invitations/actions",
    methods: ["POST"],
    domain: "portal",
    authLevel: "authenticated",
    rateLimit: "API",
    description: "Invitation management",
  },
  {
    path: "/api/portal/messages/actions",
    methods: ["POST"],
    domain: "portal",
    authLevel: "authenticated",
    rateLimit: "API",
    description: "Message/thread operations",
  },

  // ── Trades Domain ────────────────────────────────────────────────────────
  {
    path: "/api/trades/actions",
    methods: ["POST"],
    domain: "trades",
    authLevel: "authenticated",
    rateLimit: "API",
    description: "Trades network operations",
  },
  {
    path: "/api/trades/company/actions",
    methods: ["POST"],
    domain: "trades",
    authLevel: "authenticated",
    rateLimit: "API",
    description: "Company management",
  },
  {
    path: "/api/trades/profile/actions",
    methods: ["POST"],
    domain: "trades",
    authLevel: "authenticated",
    rateLimit: "API",
    description: "Profile management",
  },
  {
    path: "/api/trades/connections/actions",
    methods: ["POST"],
    domain: "trades",
    authLevel: "authenticated",
    rateLimit: "API",
    description: "Connection operations",
  },

  // ── Migrations Domain ────────────────────────────────────────────────────
  {
    path: "/api/migrations/[source]/start",
    methods: ["GET", "POST"],
    domain: "migrations",
    authLevel: "org-member",
    rateLimit: "MIGRATION",
    description: "Start CRM migration (SSE streaming)",
  },
  {
    path: "/api/migrations/acculynx",
    methods: ["POST"],
    domain: "migrations",
    authLevel: "org-member",
    rateLimit: "MIGRATION",
    deprecated: true,
    deprecatedBy: "/api/migrations/acculynx/start",
    description: "Legacy AccuLynx migration endpoint",
  },
  {
    path: "/api/migrations/jobnimbus",
    methods: ["POST"],
    domain: "migrations",
    authLevel: "org-member",
    rateLimit: "MIGRATION",
    deprecated: true,
    deprecatedBy: "/api/migrations/jobnimbus/start",
    description: "Legacy JobNimbus migration endpoint",
  },

  // ── AI Domain ────────────────────────────────────────────────────────────
  {
    path: "/api/ai/chat",
    methods: ["POST"],
    domain: "ai",
    authLevel: "authenticated",
    rateLimit: "AI",
    description: "AI chat completions",
  },
  {
    path: "/api/ai/damage/analyze",
    methods: ["POST"],
    domain: "ai",
    authLevel: "authenticated",
    rateLimit: "AI",
    description: "Damage analysis from photos",
  },
  {
    path: "/api/ai/inspect",
    methods: ["POST"],
    domain: "ai",
    authLevel: "authenticated",
    rateLimit: "AI",
    description: "Property inspection AI",
  },

  // ── Billing Domain ───────────────────────────────────────────────────────
  {
    path: "/api/billing/status",
    methods: ["GET"],
    domain: "billing",
    authLevel: "org-member",
    rateLimit: "API",
    description: "Get billing status",
  },
  {
    path: "/api/billing/create-subscription",
    methods: ["POST"],
    domain: "billing",
    authLevel: "org-member",
    rateLimit: "API",
    description: "Create Stripe subscription",
  },
  {
    path: "/api/stripe/checkout",
    methods: ["POST"],
    domain: "billing",
    authLevel: "org-member",
    rateLimit: "API",
    description: "Create Stripe checkout session",
  },

  // ── Webhooks Domain ──────────────────────────────────────────────────────
  {
    path: "/api/webhooks/stripe",
    methods: ["POST"],
    domain: "webhooks",
    authLevel: "public",
    rateLimit: "WEBHOOK",
    description: "Stripe webhook receiver",
  },
  {
    path: "/api/webhooks/clerk",
    methods: ["POST"],
    domain: "webhooks",
    authLevel: "public",
    rateLimit: "WEBHOOK",
    description: "Clerk webhook receiver",
  },
  {
    path: "/api/webhooks/twilio",
    methods: ["POST"],
    domain: "webhooks",
    authLevel: "public",
    rateLimit: "WEBHOOK",
    description: "Twilio webhook receiver",
  },

  // ── Health Domain ────────────────────────────────────────────────────────
  {
    path: "/api/health",
    methods: ["GET"],
    domain: "health",
    authLevel: "public",
    rateLimit: "PUBLIC",
    description: "Basic health check",
  },
  {
    path: "/api/health/live",
    methods: ["GET"],
    domain: "health",
    authLevel: "public",
    rateLimit: "PUBLIC",
    description: "Liveness probe",
  },
  {
    path: "/api/health/ready",
    methods: ["GET"],
    domain: "health",
    authLevel: "public",
    rateLimit: "PUBLIC",
    description: "Readiness probe",
  },
  {
    path: "/api/health/summary",
    methods: ["GET"],
    domain: "health",
    authLevel: "admin",
    rateLimit: "API",
    description: "Detailed health summary",
  },

  // ── Integrations Domain ──────────────────────────────────────────────────
  {
    path: "/api/integrations/quickbooks/status",
    methods: ["GET"],
    domain: "integrations",
    authLevel: "org-member",
    rateLimit: "API",
    description: "QuickBooks connection status",
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get routes by domain
 */
export function getRoutesByDomain(domain: ApiDomain): RouteMetadata[] {
  return API_ROUTE_REGISTRY.filter((r) => r.domain === domain);
}

/**
 * Get deprecated routes
 */
export function getDeprecatedRoutes(): RouteMetadata[] {
  return API_ROUTE_REGISTRY.filter((r) => r.deprecated);
}

/**
 * Get routes by auth level
 */
export function getRoutesByAuthLevel(level: AuthLevel): RouteMetadata[] {
  return API_ROUTE_REGISTRY.filter((r) => r.authLevel === level);
}

/**
 * Get route metadata by path
 */
export function getRouteMetadata(path: string): RouteMetadata | undefined {
  // Normalize path for matching
  const normalized = path.replace(/\/\[.*?\]/g, "/[param]");
  return API_ROUTE_REGISTRY.find((r) => {
    const routeNormalized = r.path.replace(/\/\[.*?\]/g, "/[param]");
    return routeNormalized === normalized;
  });
}

/**
 * Generate route statistics
 */
export function getRouteStats() {
  const byDomain: Record<string, number> = {};
  const byAuthLevel: Record<string, number> = {};
  const byRateLimit: Record<string, number> = {};
  let deprecated = 0;

  for (const route of API_ROUTE_REGISTRY) {
    byDomain[route.domain] = (byDomain[route.domain] || 0) + 1;
    byAuthLevel[route.authLevel] = (byAuthLevel[route.authLevel] || 0) + 1;
    byRateLimit[route.rateLimit] = (byRateLimit[route.rateLimit] || 0) + 1;
    if (route.deprecated) deprecated++;
  }

  return {
    total: API_ROUTE_REGISTRY.length,
    byDomain,
    byAuthLevel,
    byRateLimit,
    deprecated,
  };
}
