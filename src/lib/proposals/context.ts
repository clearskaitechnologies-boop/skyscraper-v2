/**
 * PHASE 3 SPRINT 3: ProposalContext Normalizer
 * Aggregates data from 6 sources: Org, Client, Job, Evidence, Weather, DOL
 */

import { getDelegate } from "@/lib/db/modelAliases";
import prisma from "@/lib/prisma";

import type { ProposalContext } from "./types";

export async function buildProposalContext({
  orgId,
  leadId,
  jobId,
}: {
  orgId: string;
  leadId: string;
  jobId: string;
}): Promise<ProposalContext> {
  // Fetch organization with branding
  const orgRecord = await prisma.org.findUnique({
    where: { id: orgId },
  });

  if (!orgRecord) {
    throw new Error(`Organization not found: ${orgId}`);
  }

  // Fetch Org branding separately
  const branding = await prisma.org_branding.findFirst({
    where: { orgId },
  });

  // Fetch lead (must exist; no synthetic fallback)
  const lead = await prisma.leads.findUnique({
    where: { id: leadId },
  });
  if (!lead) {
    throw new Error(`NOT_FOUND:lead:${leadId}`);
  }

  const contact = await prisma.contacts.findUnique({
    where: { id: lead.contactId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      street: true,
      city: true,
      state: true,
      zipCode: true,
    },
  });

  // Fetch job (must exist; enforce linkage if present) with needed relations
  const job = await prisma.jobs.findUnique({
    where: { id: jobId },
  });
  if (!job) {
    throw new Error(`NOT_FOUND:job:${jobId}`);
  }

  // Fetch evidence (photos/docs) for this job or claim
  const evidence = await getDelegate("FileAsset").findMany({
    where: {
      OR: [job.claimId ? { claimId: job.claimId } : undefined, { leadId }].filter(Boolean) as any,
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  // Fetch AI reports for this job (may contain weather/damage analysis)
  const aiReports = await prisma.ai_reports.findMany({
    where: {
      claimId: job.claimId || undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Extract weather and damage data from AI reports
  const weatherData =
    job && job.equipment && typeof job.equipment === "object" && "weather" in (job.equipment as any)
      ? (
          job.equipment as {
            weather?: { summary?: string; windMph?: number; precipIn?: number; tempF?: number };
          }
        ).weather
      : null;

  const damageReport = aiReports.find((r) => r.type === "damage" || r.type === "inspection");

  const [property, claim] = await Promise.all([
    prisma.properties.findUnique({ where: { id: job.propertyId } }),
    job.claimId ? prisma.claims.findUnique({ where: { id: job.claimId } }) : Promise.resolve(null),
  ]);

  // Normalize into ProposalContext
  const context: ProposalContext = {
    org: {
      id: orgRecord.id,
      name: orgRecord.name,
      logoUrl: branding?.logoUrl || null,
      primaryColor: branding?.colorPrimary || "#0F172A",
      secondaryColor: branding?.colorAccent || "#6B7280",
      contactEmail: branding?.email || null,
      contactPhone: branding?.phone || null,
      address: branding?.website || null,
      subdomain: null, // TODO: Add subdomain to OrgBranding schema
      fontFamily: "Inter", // TODO: Add fontFamily to OrgBranding schema
    },
    client: contact
      ? {
          id: contact.id,
          name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "Client",
          email: contact.email || null,
          phone: contact.phone || null,
          address:
            `${contact.street || ""} ${contact.city || ""}, ${contact.state || ""} ${contact.zipCode || ""}`.trim() ||
            null,
          carrier: null,
          policyNumber: null,
          claimNumber: null,
        }
      : {
          id: "missing-contact",
          name: "Client",
          email: null,
          phone: null,
          address: null,
          carrier: null,
          policyNumber: null,
          claimNumber: null,
        },
    job: {
      id: job.id,
      title: job.title,
      description: job.description,
      propertyType: property?.propertyType || null,
      lossType: claim?.damageType || null,
      lossDate: claim?.dateOfLoss || null,
      sqft: property?.squareFootage || null,
      stories: null, // Not in Property schema
      status: job.status,
      createdAt: job.createdAt,
    },
    evidence: evidence.map((e) => ({
      id: e.id,
      filename: e.filename,
      url: e.publicUrl,
      mimeType: e.mimeType,
      caption: e.note || null,
      uploadedAt: e.createdAt,
    })),
    weather: weatherData
      ? {
          summary: weatherData.summary || null,
          windMph: weatherData.windMph || null,
          precipIn: weatherData.precipIn || null,
          tempF: weatherData.tempF || null,
          reportDate: job.updatedAt,
        }
      : null,
    dol: damageReport
      ? {
          summary:
            typeof damageReport.content === "string"
              ? damageReport.content
              : JSON.stringify(damageReport.content),
          causation: null,
          recommendations: damageReport.title || null,
          reportDate: damageReport.createdAt,
        }
      : null,
  };

  return context;
}

/**
 * Validate context has minimum required data
 */
export function validateProposalContext(
  context: ProposalContext,
  packetType: "retail" | "claims" | "contractor"
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!context.org.name) missing.push("Organization name");
  if (!context.client.name) missing.push("Client name");
  if (!context.job.title) missing.push("Job title");

  // Claims packets require additional data
  if (packetType === "claims") {
    if (!context.client.carrier) missing.push("Insurance carrier");
    if (!context.client.claimNumber) missing.push("Claim number");
    if (context.evidence.length === 0) missing.push("Evidence photos");
  }

  // Contractor packets require job-specific data
  if (packetType === "contractor") {
    if (!context.client.address) missing.push("Client address");
    if (!context.job.description) missing.push("Job description");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
