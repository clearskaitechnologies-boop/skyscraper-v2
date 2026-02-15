// src/lib/report-engine/collectors/documents.ts
import prisma from "@/lib/prisma";

// ── Document relation types for type-safe access ──

interface EstimateRecord {
  id: string;
  title?: string;
  mode?: string;
  source?: { carrierPdfId?: string } | null;
  subtotal?: number;
  tax?: number;
  total?: number;
  grandTotal?: number;
  scopeItems?: unknown;
  notes?: string;
  oAndPEnabled?: boolean;
  overheadPercent?: number;
  profitPercent?: number;
  createdAt?: Date;
}

interface SupplementRecord {
  id: string;
  status?: string;
  claimNumber?: string;
  carrier?: string;
  subtotal?: number;
  tax?: number;
  opAmount?: number;
  total?: number;
  notes?: string;
  scopeItems?: { lineItems?: unknown[] } | null;
  autoDetected?: boolean;
  items?: unknown[];
  createdAt?: Date;
}

interface DamageAssessmentRecord {
  id: string;
  peril?: string;
  summary?: string;
  severity?: string;
  findings?: unknown[];
  recommendations?: unknown[];
  createdAt?: Date;
}

interface WeatherReportRecord {
  id: string;
  source?: string;
  verificationStatus?: string;
  summary?: string;
  conditions?: unknown;
  hailSize?: number;
  windSpeed?: number;
  precipitation?: number;
  reportDate?: Date;
  createdAt?: Date;
}

interface ScopeRecord {
  id: string;
  title?: string;
  summary?: string;
  scopeItems?: unknown;
  status?: string;
  createdAt?: Date;
}

interface InspectionRecord {
  id: string;
  title?: string;
  type?: string;
  status?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  notes?: string;
  photoCount?: number;
  weatherData?: unknown;
}

interface ClaimWithDocumentRelations {
  estimates?: EstimateRecord[];
  supplements?: SupplementRecord[];
  damageAssessments?: DamageAssessmentRecord[];
  weatherReports?: WeatherReportRecord[];
  scopes?: ScopeRecord[];
  inspections?: InspectionRecord[];
}

/**
 * AI-PARSED DOCUMENT COLLECTOR
 * This is the most powerful collector—it merges:
 * - Carrier estimate
 * - Contractor estimates
 * - Supplements (with line items)
 * - Damage assessments (AI findings)
 * - Weather reports
 * - Scopes of work
 * - Any uploaded files/photos
 */
export async function collectDocumentDataset(claimId: string) {
  const claim = await prisma.claims.findUnique({ where: { id: claimId } });

  if (!claim) {
    return {
      carrierEstimate: null,
      contractorEstimates: [],
      supplements: [],
      supplementItems: [],
      aiFindings: [],
      weatherReports: [],
      scopeDocs: [],
      inspections: [],
    };
  }

  const claimData = claim as unknown as ClaimWithDocumentRelations;

  // Separate carrier vs contractor estimates
  const carrierEstimate =
    claimData.estimates?.find((e) => e.mode === "insurance" || e.source?.carrierPdfId) ?? null;

  const contractorEstimates =
    claimData.estimates?.filter((e) => e.mode !== "insurance" && !e.source?.carrierPdfId) ?? [];

  // Extract all supplement line items
  const allSupplementItems =
    claimData.supplements?.flatMap((s) => {
      // Try to get items from items relation or from scopeItems JSON
      const relationItems = s.items ?? [];
      const scopeItems = s.scopeItems?.lineItems ?? [];
      return [...relationItems, ...scopeItems];
    }) ?? [];

  // Extract AI damage findings
  const aiFindings =
    claimData.damageAssessments?.map((da) => ({
      id: da.id,
      peril: da.peril,
      summary: da.summary,
      severity: da.severity,
      findings: da.findings ?? [],
      recommendations: da.recommendations ?? [],
      createdAt: da.createdAt,
    })) ?? [];

  return {
    // Estimates
    carrierEstimate: carrierEstimate
      ? {
          id: carrierEstimate.id,
          title: carrierEstimate.title,
          mode: carrierEstimate.mode,
          subtotal: carrierEstimate.subtotal,
          tax: carrierEstimate.tax,
          total: carrierEstimate.total,
          grandTotal: carrierEstimate.grandTotal,
          scopeItems: carrierEstimate.scopeItems,
          notes: carrierEstimate.notes,
          createdAt: carrierEstimate.createdAt,
        }
      : null,

    contractorEstimates: contractorEstimates.map((e) => ({
      id: e.id,
      title: e.title,
      mode: e.mode,
      subtotal: e.subtotal,
      tax: e.tax,
      total: e.total,
      grandTotal: e.grandTotal,
      scopeItems: e.scopeItems,
      oAndPEnabled: e.oAndPEnabled,
      overheadPercent: e.overheadPercent,
      profitPercent: e.profitPercent,
      notes: e.notes,
      createdAt: e.createdAt,
    })),

    // Supplements
    supplements:
      claimData.supplements?.map((s) => ({
        id: s.id,
        status: s.status,
        claimNumber: s.claimNumber,
        carrier: s.carrier,
        subtotal: s.subtotal,
        tax: s.tax,
        opAmount: s.opAmount,
        total: s.total,
        notes: s.notes,
        scopeItems: s.scopeItems,
        autoDetected: s.autoDetected,
        createdAt: s.createdAt,
      })) ?? [],

    supplementItems: allSupplementItems,

    // AI-generated insights
    aiFindings,

    // Weather data
    weatherReports:
      claimData.weatherReports?.map((wr) => ({
        id: wr.id,
        source: wr.source,
        verificationStatus: wr.verificationStatus,
        summary: wr.summary,
        conditions: wr.conditions,
        hailSize: wr.hailSize,
        windSpeed: wr.windSpeed,
        precipitation: wr.precipitation,
        reportDate: wr.reportDate,
        createdAt: wr.createdAt,
      })) ?? [],

    // Scopes of work
    scopeDocs:
      claimData.scopes?.map((s) => ({
        id: s.id,
        title: s.title,
        summary: s.summary,
        scopeItems: s.scopeItems,
        status: s.status,
        createdAt: s.createdAt,
      })) ?? [],

    // Inspections
    inspections:
      claimData.inspections?.map((i) => ({
        id: i.id,
        title: i.title,
        type: i.type,
        status: i.status,
        scheduledAt: i.scheduledAt,
        completedAt: i.completedAt,
        notes: i.notes,
        photoCount: i.photoCount,
        weatherData: i.weatherData,
      })) ?? [],
  };
}
