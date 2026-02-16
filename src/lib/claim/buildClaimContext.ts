/**
 * Claim Context Builder
 * Single source of truth for document generation
 * Aggregates all claim data: intake, scopes, weather, evidence, carrier rules
 */

import { getCachedClaimContext, setCachedClaimContext } from "@/lib/cache/claimContextCache";
import { computeVariances, Variance } from "@/lib/delta/computeDelta";
import { logger } from "@/lib/observability/logger";
import prisma from "@/lib/prisma";
import { carrierRouter } from "@/lib/rebuttals/carrierRouter";
import { formatWeatherForAI } from "@/lib/weather/openMeteo";

export type ClaimContext = {
  // Core claim info
  claim: {
    id: string;
    claimNumber: string;
    orgId: string;
    propertyAddress: string;
    lossDate: string;
    lossType: string;
    damageType: string;
    status: string;
    insured_name?: string;
    policyNumber?: string;
    carrier?: string;
    adjusterName?: string;
    adjusterEmail?: string;
    adjusterPhone?: string;
  };

  // Property details
  property?: {
    address: string;
    city?: string;
    state?: string;
    zip?: string;
    structureType?: string;
    roofType?: string;
    squareFootage?: number;
  };

  // Scopes (if imported)
  scopes: {
    adjuster: Array<{
      id: string;
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      total: number;
      category: string;
      originalCode?: string;
    }>;
    contractor: Array<{
      id: string;
      description: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      total: number;
      category: string;
      originalCode?: string;
    }>;
  };

  // Computed variances (if scopes exist)
  variances: Variance[];

  // Weather verification (if fetched)
  weather?: {
    facts: string; // Formatted for AI
    raw: {
      maxWindGustMph?: number | null;
      maxSustainedWindMph?: number | null;
      maxHailInches?: number | null;
      precipitationIn?: number | null;
      snowfallIn?: number | null;
      sourceLabel: string;
      fetchedAt: Date;
      provider: string;
      eventStart: Date;
      eventEnd: Date;
    };
  };

  // Evidence collections (if uploaded)
  evidence: {
    collections: Array<{
      sectionKey: string;
      title: string;
      assetCount: number;
    }>;
    totalAssets: number;
  };

  // Carrier-specific routing (if carrier known)
  carrierStrategy?: {
    tone: "conciliatory" | "assertive" | "procedural";
    emphasize: string[];
    requireCitations: boolean;
  };

  // Organization info
  organization: {
    name: string;
    brandLogoUrl?: string;
    contactInfo?: {
      address?: string;
      phone?: string;
      email?: string;
    };
  };
};

/**
 * Build complete claim context for document generation
 * Cached for 5 minutes to reduce database load on hot claims
 */
export async function buildClaimContext(claimId: string, skipCache = false): Promise<ClaimContext> {
  // Check cache first (unless skipCache flag is set)
  if (!skipCache) {
    const cached = await getCachedClaimContext(claimId);
    if (cached) {
      logger.debug("Claim context cache hit", { claimId });
      return cached;
    }
  }

  logger.info("Building claim context", { claimId });

  // OPTIMIZATION: Parallel fetch of all claim data (reduces sequential DB roundtrips)
  const startTime = Date.now();

  const [claim, weatherReport] = await Promise.all([
    // 1. Fetch claim with property in single query (avoid N+1)
    prisma.claims.findUnique({
      where: { id: claimId },
      include: {
        properties: {
          select: {
            street: true,
            city: true,
            state: true,
            zipCode: true,
            squareFootage: true,
            roofType: true,
            propertyType: true,
          },
        },
      },
    }),

    // 2. Fetch weather
    prisma.weather_reports.findFirst({
      where: { claimId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Note: scope_items are related to scope_areas, not directly to claims
  // For now, we'll leave scopes empty and they can be populated separately
  const scopeItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
    category: string;
    originalCode?: string;
    source: string;
  }> = [];

  // Evidence collections don't exist in schema yet
  const collections: Array<{ sectionKey: string; title: string; _count: { items: number } }> = [];
  const totalAssets = 0;

  if (!claim) {
    throw new Error(`Claim not found: ${claimId}`);
  }

  // 7. Fetch organization (now that we know orgId)
  const orgData = await prisma.org.findUnique({
    where: { id: claim.orgId },
    select: {
      id: true,
      name: true,
    },
  });

  if (!orgData) {
    throw new Error(`Organization not found: ${claim.orgId}`);
  }

  // Split scope items by source
  const adjusterItems = scopeItems.filter((item) => item.source === "ADJUSTER");
  const contractorItems = scopeItems.filter((item) => item.source === "CONTRACTOR");

  const propertyData = claim.properties;
  const fullAddress = [
    propertyData?.street,
    propertyData?.city,
    propertyData?.state,
    propertyData?.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  const queryTime = Date.now() - startTime;
  logger.debug("Claim context queries completed", { claimId, queryTimeMs: queryTime });

  // 8. Compute variances (if both scopes exist)
  let variances: Variance[] = [];
  if (adjusterItems.length > 0 && contractorItems.length > 0) {
    variances = computeVariances(
      adjusterItems.map((item) => ({
        description: item.description,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      contractorItems.map((item) => ({
        description: item.description,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      }))
    );
  }

  // 9. Build weather context (already fetched in parallel)
  // Extract weather facts from the globalSummary or providerRaw JSON
  const rawWeather = weatherReport?.providerRaw as Record<string, unknown> | null;
  const weatherContext = weatherReport
    ? {
        facts: formatWeatherForAI({
          maxWindGustMph: (rawWeather?.maxWindGustMph as number) ?? null,
          maxSustainedWindMph: (rawWeather?.maxSustainedWindMph as number) ?? null,
          maxHailInches: (rawWeather?.maxHailInches as number) ?? null,
          precipitationIn: (rawWeather?.precipitationIn as number) ?? null,
          snowfallIn: (rawWeather?.snowfallIn as number) ?? null,
          sourceLabel: weatherReport.mode || "Weather Report",
          raw: rawWeather ?? {},
        }),
        raw: {
          maxWindGustMph: (rawWeather?.maxWindGustMph as number) ?? null,
          maxSustainedWindMph: (rawWeather?.maxSustainedWindMph as number) ?? null,
          maxHailInches: (rawWeather?.maxHailInches as number) ?? null,
          precipitationIn: (rawWeather?.precipitationIn as number) ?? null,
          snowfallIn: (rawWeather?.snowfallIn as number) ?? null,
          sourceLabel: weatherReport.mode || "Weather Report",
          fetchedAt: weatherReport.createdAt,
          provider: weatherReport.mode,
          eventStart: weatherReport.periodFrom ?? weatherReport.dol ?? new Date(),
          eventEnd: weatherReport.periodTo ?? weatherReport.dol ?? new Date(),
        },
      }
    : undefined;

  // 10. Get carrier strategy (if carrier known)
  const carrierStrategy = claim.carrier ? carrierRouter(claim.carrier) : undefined;

  // 11. Build context
  const context: ClaimContext = {
    claim: {
      id: claim.id,
      claimNumber: claim.claimNumber,
      orgId: claim.orgId,
      propertyAddress: fullAddress,
      lossDate: claim.dateOfLoss.toISOString(),
      lossType: claim.damageType || "UNKNOWN",
      damageType: claim.damageType,
      status: claim.status,
      insured_name: claim.insured_name || undefined,
      policyNumber: claim.policy_number || undefined,
      carrier: claim.carrier || undefined,
      adjusterName: claim.adjusterName || undefined,
      adjusterEmail: claim.adjusterEmail || undefined,
      adjusterPhone: claim.adjusterPhone || undefined,
    },

    property: propertyData
      ? {
          address: fullAddress,
          city: propertyData.city,
          state: propertyData.state,
          zip: propertyData.zipCode,
          structureType: propertyData.propertyType || undefined,
          roofType: propertyData.roofType || undefined,
          squareFootage: propertyData.squareFootage || undefined,
        }
      : undefined,

    scopes: {
      adjuster: adjusterItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total,
        category: item.category,
        originalCode: item.originalCode || undefined,
      })),
      contractor: contractorItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        total: item.total,
        category: item.category,
        originalCode: item.originalCode || undefined,
      })),
    },

    variances,

    weather: weatherContext,

    evidence: {
      collections: collections.map((c) => ({
        sectionKey: c.sectionKey,
        title: c.title,
        assetCount: c._count.items,
      })),
      totalAssets,
    },

    carrierStrategy: carrierStrategy
      ? {
          tone: carrierStrategy.tone as "assertive" | "conciliatory" | "procedural",
          emphasize: carrierStrategy.emphasize,
          requireCitations: carrierStrategy.requireCitations,
        }
      : undefined,

    organization: {
      name: orgData.name,
      brandLogoUrl: undefined, // TODO: Add to org model if needed
      contactInfo: undefined, // TODO: Add to org model if needed
    },
  };

  // Cache the result (fire and forget - don't block on cache write)
  setCachedClaimContext(claimId, context).catch((err) => {
    logger.error("[CACHE] Failed to cache claim context:", err);
  });

  return context;
}

/**
 * Check if claim has minimum data for document generation
 */
export function validateClaimContext(context: ClaimContext): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.claim.lossDate) {
    errors.push("Loss date is required");
  }

  // Scopes validation
  if (context.scopes.adjuster.length === 0) {
    warnings.push("No adjuster scope imported - variance analysis unavailable");
  }
  if (context.scopes.contractor.length === 0) {
    warnings.push("No contractor scope imported - variance analysis unavailable");
  }

  // Weather validation
  if (!context.weather) {
    warnings.push("Weather verification not available");
  }

  // Evidence validation
  if (context.evidence.totalAssets === 0) {
    warnings.push("No evidence photos uploaded");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
