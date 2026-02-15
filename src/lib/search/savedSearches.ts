/**
 * TASK 92: SAVED SEARCHES
 *
 * Save, manage, and share search queries with notifications.
 */

import prisma from "@/lib/prisma";

import { SearchOptions } from "./advanced";

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  entity: string;
  query: string;
  filters: Record<string, any>;
  isPublic: boolean;
  createdBy: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create saved search
 */
export async function createSavedSearch(
  organizationId: string,
  userId: string,
  data: {
    name: string;
    description?: string;
    searchOptions: SearchOptions;
    isPublic?: boolean;
    notify?: boolean;
  }
): Promise<string> {
  const savedSearch = await prisma.savedSearch.create({
    data: {
      organizationId,
      userId,
      name: data.name,
      description: data.description,
      entity: data.searchOptions.entities?.[0] || "ALL",
      query: data.searchOptions.query,
      filters: data.searchOptions.filters || {},
      isPublic: data.isPublic || false,
      notify: data.notify || false,
    },
  });

  return savedSearch.id;
}

/**
 * Update saved search
 */
export async function updateSavedSearch(
  searchId: string,
  updates: {
    name?: string;
    description?: string;
    searchOptions?: SearchOptions;
    isPublic?: boolean;
    notify?: boolean;
  }
): Promise<void> {
  const updateData: any = {};

  if (updates.name) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;
  if (updates.notify !== undefined) updateData.notify = updates.notify;

  if (updates.searchOptions) {
    if (updates.searchOptions.query) updateData.query = updates.searchOptions.query;
    if (updates.searchOptions.filters) updateData.filters = updates.searchOptions.filters;
    if (updates.searchOptions.entities) updateData.entity = updates.searchOptions.entities[0];
  }

  await prisma.savedSearch.update({
    where: { id: searchId },
    data: updateData,
  });
}

/**
 * Delete saved search
 */
export async function deleteSavedSearch(searchId: string): Promise<void> {
  await prisma.savedSearch.delete({
    where: { id: searchId },
  });
}

/**
 * Get saved search
 */
export async function getSavedSearch(searchId: string): Promise<SavedSearch> {
  const search = await prisma.savedSearch.findUnique({
    where: { id: searchId },
  });

  if (!search) {
    throw new Error("Saved search not found");
  }

  return search as any;
}

/**
 * List user's saved searches
 */
export async function listSavedSearches(
  organizationId: string,
  userId?: string
): Promise<SavedSearch[]> {
  const whereClause: any = { organizationId };

  if (userId) {
    whereClause.OR = [{ userId }, { isPublic: true }];
  }

  const searches = await prisma.savedSearch.findMany({
    where: whereClause,
    orderBy: { updatedAt: "desc" },
  });

  return searches as any;
}

/**
 * Execute saved search
 */
export async function executeSavedSearch(searchId: string): Promise<any> {
  const search = await getSavedSearch(searchId);

  // Import here to avoid circular dependency
  const { search: performSearch } = await import("./advanced");

  const results = await performSearch(search.orgId, {
    query: search.query,
    entities: [search.entity as any],
    filters: search.filters as any,
  });

  // Update last executed time
  await prisma.savedSearch.update({
    where: { id: searchId },
    data: { lastExecuted: new Date() },
  });

  return results;
}

/**
 * Share saved search with users
 */
export async function shareSavedSearch(searchId: string, userIds: string[]): Promise<void> {
  const search = await getSavedSearch(searchId);

  for (const userId of userIds) {
    await prisma.savedSearchShare.create({
      data: {
        savedSearchId: searchId,
        userId,
        sharedBy: search.createdBy,
      },
    });
  }
}

/**
 * Get users who have access to saved search
 */
export async function getSavedSearchShares(searchId: string): Promise<
  {
    userId: string;
    user: any;
    sharedAt: Date;
  }[]
> {
  const shares = await prisma.savedSearchShare.findMany({
    where: { savedSearchId: searchId },
    include: { user: true },
  });

  return shares.map((share) => ({
    userId: share.userId,
    user: share.user,
    sharedAt: share.createdAt,
  }));
}

/**
 * Subscribe to saved search notifications
 */
export async function subscribeSavedSearch(searchId: string, userId: string): Promise<void> {
  await prisma.savedSearchSubscription.create({
    data: {
      savedSearchId: searchId,
      userId,
    },
  });
}

/**
 * Unsubscribe from saved search notifications
 */
export async function unsubscribeSavedSearch(searchId: string, userId: string): Promise<void> {
  await prisma.savedSearchSubscription.deleteMany({
    where: {
      savedSearchId: searchId,
      userId,
    },
  });
}

/**
 * Check for new results in saved searches (run periodically)
 */
export async function checkSavedSearches(): Promise<void> {
  const searches = await prisma.savedSearch.findMany({
    where: { notify: true },
  });

  for (const search of searches) {
    const results = await executeSavedSearch(search.id);

    // Get previous result count
    const previousCount = search.lastResultCount || 0;

    if (results.total > previousCount) {
      // New results found, notify subscribers
      await notifyNewResults(search.id, results.total - previousCount);
    }

    // Update last result count
    await prisma.savedSearch.update({
      where: { id: search.id },
      data: { lastResultCount: results.total },
    });
  }
}

/**
 * Notify users of new results
 */
async function notifyNewResults(searchId: string, newCount: number): Promise<void> {
  const search = await getSavedSearch(searchId);
  const subscriptions = await prisma.savedSearchSubscription.findMany({
    where: { savedSearchId: searchId },
  });

  for (const sub of subscriptions) {
    await prisma.projectNotification.create({
      data: {
        userId: sub.userId,
        type: "SAVED_SEARCH",
        title: "New search results",
        message: `${newCount} new results for "${search.name}"`,
        data: { searchId: search.id },
      },
    });
  }
}

/**
 * Duplicate saved search
 */
export async function duplicateSavedSearch(
  searchId: string,
  userId: string,
  newName?: string
): Promise<string> {
  const original = await getSavedSearch(searchId);

  const duplicate = await prisma.savedSearch.create({
    data: {
      organizationId: original.orgId,
      userId,
      name: newName || `${original.name} (Copy)`,
      description: original.description,
      entity: original.entity,
      query: original.query,
      filters: original.filters,
      isPublic: false,
      notify: false,
    },
  });

  return duplicate.id;
}

/**
 * Get saved search statistics
 */
export async function getSavedSearchStats(searchId: string): Promise<{
  executionCount: number;
  lastExecuted?: Date;
  averageResults: number;
  subscribers: number;
}> {
  const search = await getSavedSearch(searchId);
  const subscriptions = await prisma.savedSearchSubscription.count({
    where: { savedSearchId: searchId },
  });

  return {
    executionCount: 0, // TODO: Track executions
    lastExecuted: search.lastExecuted || undefined,
    averageResults: search.lastResultCount || 0,
    subscribers: subscriptions,
  };
}

/**
 * Export saved search results
 */
export async function exportSavedSearchResults(
  searchId: string,
  format: "csv" | "json" | "excel"
): Promise<Buffer> {
  const results = await executeSavedSearch(searchId);

  // TODO: Implement export format conversion
  return Buffer.from(JSON.stringify(results, null, 2));
}
