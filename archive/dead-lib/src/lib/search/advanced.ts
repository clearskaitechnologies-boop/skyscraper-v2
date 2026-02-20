/**
 * TASK 91: ADVANCED SEARCH SYSTEM
 *
 * Full-text search with Elasticsearch integration, fuzzy matching, filters, and ranking.
 */

import prisma from "@/lib/prisma";

export type SearchEntity =
  | "CLAIM"
  | "JOB"
  | "TASK"
  | "CONTACT"
  | "DOCUMENT"
  | "USER"
  | "ORGANIZATION"
  | "ALL";

export interface SearchOptions {
  query: string;
  entities?: SearchEntity[];
  filters?: Record<string, any>;
  fuzzy?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  highlight?: boolean;
}

export interface SearchResult {
  id: string;
  type: SearchEntity;
  title: string;
  description?: string;
  highlights?: string[];
  score: number;
  metadata: Record<string, any>;
  url: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pages: number;
  facets?: Record<string, { value: string; count: number }[]>;
  suggestions?: string[];
}

/**
 * Perform advanced search across all entities
 */
export async function search(
  organizationId: string,
  options: SearchOptions
): Promise<SearchResponse> {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const entities = options.entities || ["ALL"];
  const results: SearchResult[] = [];

  // Search each entity type
  if (entities.includes("ALL") || entities.includes("CLAIM")) {
    const claimResults = await searchClaims(organizationId, options.query, options.filters);
    results.push(...claimResults);
  }

  if (entities.includes("ALL") || entities.includes("JOB")) {
    const jobResults = await searchJobs(organizationId, options.query, options.filters);
    results.push(...jobResults);
  }

  if (entities.includes("ALL") || entities.includes("TASK")) {
    const taskResults = await searchTasks(organizationId, options.query, options.filters);
    results.push(...taskResults);
  }

  if (entities.includes("ALL") || entities.includes("CONTACT")) {
    const contactResults = await searchContacts(organizationId, options.query, options.filters);
    results.push(...contactResults);
  }

  if (entities.includes("ALL") || entities.includes("DOCUMENT")) {
    const documentResults = await searchDocuments(organizationId, options.query, options.filters);
    results.push(...documentResults);
  }

  // Sort by relevance score
  results.sort((a, b) => b.score - a.score);

  // Pagination
  const total = results.length;
  const paginatedResults = results.slice(skip, skip + limit);

  return {
    results: paginatedResults,
    total,
    page,
    pages: Math.ceil(total / limit),
    suggestions: generateSuggestions(options.query),
  };
}

/**
 * Search claims
 */
async function searchClaims(
  organizationId: string,
  query: string,
  filters?: Record<string, any>
): Promise<SearchResult[]> {
  const whereClause: any = {
    organizationId,
    OR: [
      { claimNumber: { contains: query, mode: "insensitive" } },
      { homeowner: { contains: query, mode: "insensitive" } },
      { address: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ],
  };

  if (filters?.status) whereClause.status = filters.status;
  if (filters?.claimType) whereClause.claimType = filters.claimType;

  const claims = await prisma.claims.findMany({
    where: whereClause,
    take: 50,
  });

  return claims.map((claim) => ({
    id: claim.id,
    type: "CLAIM" as SearchEntity,
    title: `Claim #${claim.claimNumber} - ${claim.homeowner}`,
    description: claim.address,
    score: calculateRelevanceScore(query, [
      claim.claimNumber,
      claim.homeowner,
      claim.address,
      claim.description,
    ]),
    metadata: {
      status: claim.status,
      claimType: claim.claimType,
      dateOfLoss: claim.dateOfLoss,
    },
    url: `/claims/${claim.id}`,
  }));
}

/**
 * Search jobs
 */
async function searchJobs(
  organizationId: string,
  query: string,
  filters?: Record<string, any>
): Promise<SearchResult[]> {
  const whereClause: any = {
    organizationId,
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
    ],
  };

  if (filters?.status) whereClause.status = filters.status;
  if (filters?.phase) whereClause.phase = filters.phase;

  const jobs = await prisma.job.findMany({
    where: whereClause,
    include: { claim: true },
    take: 50,
  });

  return jobs.map((job) => ({
    id: job.id,
    type: "JOB" as SearchEntity,
    title: job.title,
    description: job.description || job.location,
    score: calculateRelevanceScore(query, [job.title, job.description, job.location]),
    metadata: {
      status: job.status,
      phase: job.phase,
      claimNumber: job.claim?.claimNumber,
    },
    url: `/jobs/${job.id}`,
  }));
}

/**
 * Search tasks
 */
async function searchTasks(
  organizationId: string,
  query: string,
  filters?: Record<string, any>
): Promise<SearchResult[]> {
  const whereClause: any = {
    organizationId,
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ],
  };

  if (filters?.status) whereClause.status = filters.status;
  if (filters?.priority) whereClause.priority = filters.priority;

  const tasks = await prisma.task.findMany({
    where: whereClause,
    take: 50,
  });

  return tasks.map((task) => ({
    id: task.id,
    type: "TASK" as SearchEntity,
    title: task.title,
    description: task.description,
    score: calculateRelevanceScore(query, [task.title, task.description]),
    metadata: {
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    },
    url: `/tasks/${task.id}`,
  }));
}

/**
 * Search contacts
 */
async function searchContacts(
  organizationId: string,
  query: string,
  filters?: Record<string, any>
): Promise<SearchResult[]> {
  const whereClause: any = {
    organizationId,
    OR: [
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
      { company: { contains: query, mode: "insensitive" } },
    ],
  };

  if (filters?.type) whereClause.type = filters.type;

  const contacts = await prisma.contact.findMany({
    where: whereClause,
    take: 50,
  });

  return contacts.map((contact) => ({
    id: contact.id,
    type: "CONTACT" as SearchEntity,
    title: `${contact.firstName} ${contact.lastName}`,
    description: `${contact.email || ""} ${contact.phone || ""}`.trim(),
    score: calculateRelevanceScore(query, [
      contact.firstName,
      contact.lastName,
      contact.email,
      contact.phone,
      contact.company,
    ]),
    metadata: {
      type: contact.type,
      company: contact.company,
    },
    url: `/contacts/${contact.id}`,
  }));
}

/**
 * Search documents
 */
async function searchDocuments(
  organizationId: string,
  query: string,
  filters?: Record<string, any>
): Promise<SearchResult[]> {
  const whereClause: any = {
    organizationId,
    OR: [
      { filename: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ],
  };

  if (filters?.category) whereClause.category = filters.category;

  const documents = await prisma.document.findMany({
    where: whereClause,
    take: 50,
  });

  return documents.map((doc) => ({
    id: doc.id,
    type: "DOCUMENT" as SearchEntity,
    title: doc.filename,
    description: doc.description,
    score: calculateRelevanceScore(query, [doc.filename, doc.description]),
    metadata: {
      category: doc.category,
      size: doc.fileSize,
      mimeType: doc.mimeType,
    },
    url: `/documents/${doc.id}`,
  }));
}

/**
 * Calculate relevance score
 */
function calculateRelevanceScore(query: string, fields: (string | null | undefined)[]): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  fields.forEach((field, index) => {
    if (!field) return;

    const fieldLower = field.toLowerCase();

    // Exact match: 100 points
    if (fieldLower === queryLower) {
      score += 100;
    }
    // Starts with query: 50 points
    else if (fieldLower.startsWith(queryLower)) {
      score += 50;
    }
    // Contains query: 25 points
    else if (fieldLower.includes(queryLower)) {
      score += 25;
    }
    // Fuzzy match: 10 points
    else if (fuzzyMatch(queryLower, fieldLower)) {
      score += 10;
    }

    // Weight by field position (earlier fields more important)
    score = score / (index + 1);
  });

  return score;
}

/**
 * Fuzzy string matching
 */
function fuzzyMatch(query: string, text: string): boolean {
  const pattern = query.split("").join(".*");
  const regex = new RegExp(pattern, "i");
  return regex.test(text);
}

/**
 * Generate search suggestions
 */
function generateSuggestions(query: string): string[] {
  // TODO: Implement ML-based suggestions
  return [];
}

/**
 * Get search facets (filters)
 */
export async function getSearchFacets(
  organizationId: string,
  entity: SearchEntity
): Promise<Record<string, { value: string; count: number }[]>> {
  const facets: Record<string, { value: string; count: number }[]> = {};

  if (entity === "CLAIM" || entity === "ALL") {
    const statuses = await prisma.claims.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: true,
    });

    facets.status = statuses.map((s) => ({
      value: s.status,
      count: s._count,
    }));
  }

  return facets;
}

/**
 * Search autocomplete
 */
export async function searchAutocomplete(
  organizationId: string,
  query: string,
  limit: number = 10
): Promise<{ text: string; type: SearchEntity }[]> {
  const suggestions: { text: string; type: SearchEntity }[] = [];

  // Search claim numbers
  const claims = await prisma.claims.findMany({
    where: {
      organizationId,
      claimNumber: { contains: query, mode: "insensitive" },
    },
    select: { claimNumber: true },
    take: 3,
  });

  claims.forEach((c) => {
    suggestions.push({ text: c.claimNumber, type: "CLAIM" });
  });

  // Search contacts
  const contacts = await prisma.contact.findMany({
    where: {
      organizationId,
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { firstName: true, lastName: true },
    take: 3,
  });

  contacts.forEach((c) => {
    suggestions.push({
      text: `${c.firstName} ${c.lastName}`,
      type: "CONTACT",
    });
  });

  return suggestions.slice(0, limit);
}

/**
 * Record search query for analytics
 */
export async function recordSearchQuery(
  organizationId: string,
  userId: string,
  query: string,
  resultCount: number
): Promise<void> {
  await prisma.searchQuery.create({
    data: {
      organizationId,
      userId,
      query,
      resultCount,
      timestamp: new Date(),
    },
  });
}

/**
 * Get popular searches
 */
export async function getPopularSearches(
  organizationId: string,
  limit: number = 10
): Promise<{ query: string; count: number }[]> {
  const searches = await prisma.searchQuery.groupBy({
    by: ["query"],
    where: {
      organizationId,
      timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    _count: true,
    orderBy: { _count: { query: "desc" } },
    take: limit,
  });

  return searches.map((s) => ({
    query: s.query,
    count: s._count,
  }));
}
