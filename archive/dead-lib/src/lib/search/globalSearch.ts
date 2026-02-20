/**
 * Global Search System
 *
 * Search across all entities: Jobs, Claims, Leads, Clients, Documents, Messages
 * Full-text search with relevance ranking
 */

import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export type SearchableEntity = "JOB" | "CLAIM" | "LEAD" | "CLIENT" | "DOCUMENT" | "MESSAGE" | "ALL";

export interface SearchResult {
  id: string;
  type: SearchableEntity;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
  relevance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Global search across all entities
 */
export async function globalSearch(
  orgId: string,
  query: string,
  filters?: {
    type?: SearchableEntity;
    limit?: number;
    userId?: string; // Filter by creator/assignee
  }
): Promise<SearchResult[]> {
  const limit = filters?.limit || 50;
  const searchQuery = query.trim().toLowerCase();

  if (!searchQuery) return [];

  const results: SearchResult[] = [];

  try {
    // Search based on type filter
    if (!filters?.type || filters.type === "ALL") {
      const [jobs, claims, leads, clients, documents] = await Promise.all([
        searchJobs(orgId, searchQuery, limit),
        searchClaims(orgId, searchQuery, limit),
        searchLeads(orgId, searchQuery, limit),
        searchClients(orgId, searchQuery, limit),
        searchDocuments(orgId, searchQuery, limit),
      ]);

      results.push(...jobs, ...claims, ...leads, ...clients, ...documents);
    } else {
      switch (filters.type) {
        case "JOB":
          results.push(...(await searchJobs(orgId, searchQuery, limit)));
          break;
        case "CLAIM":
          results.push(...(await searchClaims(orgId, searchQuery, limit)));
          break;
        case "LEAD":
          results.push(...(await searchLeads(orgId, searchQuery, limit)));
          break;
        case "CLIENT":
          results.push(...(await searchClients(orgId, searchQuery, limit)));
          break;
        case "DOCUMENT":
          results.push(...(await searchDocuments(orgId, searchQuery, limit)));
          break;
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    return results.slice(0, limit);
  } catch (error) {
    logger.error("Global search failed:", error);
    return [];
  }
}

/**
 * Search jobs
 */
async function searchJobs(orgId: string, query: string, limit: number): Promise<SearchResult[]> {
  try {
    const jobs = await prisma.jobs
      .findMany({
        where: {
          orgId,
          OR: [
            { propertyAddress: { contains: query, mode: "insensitive" } },
            { status: { contains: query, mode: "insensitive" } },
            { type: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        include: {
          client: true,
        },
      })
      .catch(() => []);

    return jobs.map((job) => ({
      id: job.id,
      type: "JOB" as SearchableEntity,
      title: `${job.type} Job - ${job.propertyAddress}`,
      subtitle: `Status: ${job.status}`,
      description: `Value: $${job.estimatedValue}`,
      url: `/jobs/${job.id}`,
      metadata: {
        type: job.type,
        status: job.status,
        value: job.estimatedValue,
      },
      relevance: calculateRelevance(query, [job.propertyAddress, job.status, job.type]),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Search claims
 */
async function searchClaims(orgId: string, query: string, limit: number): Promise<SearchResult[]> {
  try {
    const claims = await prisma.claims.findMany({
      where: {
        orgId,
        OR: [
          { propertyAddress: { contains: query, mode: "insensitive" } },
          { insuranceCompany: { contains: query, mode: "insensitive" } },
          { policyNumber: { contains: query, mode: "insensitive" } },
          { lossType: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
    });

    return claims.map((claim) => ({
      id: claim.id,
      type: "CLAIM" as SearchableEntity,
      title: `Claim - ${claim.propertyAddress}`,
      subtitle: claim.insuranceCompany,
      description: `${claim.lossType} - Policy: ${claim.policyNumber}`,
      url: `/claims/${claim.id}`,
      metadata: {
        insuranceCompany: claim.insuranceCompany,
        lossType: claim.lossType,
      },
      relevance: calculateRelevance(query, [
        claim.propertyAddress,
        claim.insuranceCompany,
        claim.policyNumber,
        claim.lossType || "",
      ]),
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Search leads
 */
async function searchLeads(orgId: string, query: string, limit: number): Promise<SearchResult[]> {
  try {
    const leads = await prisma.leads.findMany({
      where: {
        orgId,
        OR: [
          { propertyAddress: { contains: query, mode: "insensitive" } },
          { status: { contains: query, mode: "insensitive" } },
          { source: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
    });

    return leads.map((lead) => ({
      id: lead.id,
      type: "LEAD" as SearchableEntity,
      title: `Lead - ${lead.propertyAddress}`,
      subtitle: `Source: ${lead.source}`,
      description: `Status: ${lead.status}`,
      url: `/leads/${lead.id}`,
      metadata: {
        source: lead.source,
        status: lead.status,
      },
      relevance: calculateRelevance(query, [lead.propertyAddress, lead.source, lead.status]),
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Search clients (homeowners)
 */
async function searchClients(orgId: string, query: string, limit: number): Promise<SearchResult[]> {
  try {
    const clients = await prisma.homeowner_intake.findMany({
      where: {
        orgId,
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { propertyAddress: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
    });

    return clients.map((client) => ({
      id: client.id,
      type: "CLIENT" as SearchableEntity,
      title: `${client.firstName} ${client.lastName}`,
      subtitle: client.email,
      description: client.propertyAddress,
      url: `/clients/${client.id}`,
      metadata: {
        phone: client.phone,
      },
      relevance: calculateRelevance(query, [
        client.firstName,
        client.lastName,
        client.email,
        client.phone,
        client.propertyAddress,
      ]),
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Search documents
 */
async function searchDocuments(
  orgId: string,
  query: string,
  limit: number
): Promise<SearchResult[]> {
  try {
    const documents = await prisma.documents
      .findMany({
        where: {
          orgId,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { type: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
      })
      .catch(() => []);

    return documents.map((doc) => ({
      id: doc.id,
      type: "DOCUMENT" as SearchableEntity,
      title: doc.name,
      subtitle: doc.type,
      description: doc.description || undefined,
      url: `/documents/${doc.id}`,
      metadata: {
        type: doc.type,
        size: doc.size,
      },
      relevance: calculateRelevance(query, [doc.name, doc.type, doc.description || ""]),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Calculate relevance score
 */
function calculateRelevance(query: string, fields: string[]): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  for (const field of fields) {
    const fieldLower = field.toLowerCase();

    // Exact match
    if (fieldLower === queryLower) {
      score += 100;
    }
    // Starts with
    else if (fieldLower.startsWith(queryLower)) {
      score += 50;
    }
    // Contains
    else if (fieldLower.includes(queryLower)) {
      score += 25;
    }
    // Word match
    else if (fieldLower.split(/\s+/).some((word) => word.includes(queryLower))) {
      score += 10;
    }
  }

  return score;
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(
  orgId: string,
  query: string,
  limit: number = 10
): Promise<string[]> {
  if (!query || query.length < 2) return [];

  try {
    const results = await globalSearch(orgId, query, { limit });

    // Extract unique titles as suggestions
    const suggestions = [...new Set(results.map((r) => r.title))];

    return suggestions.slice(0, limit);
  } catch {
    return [];
  }
}
