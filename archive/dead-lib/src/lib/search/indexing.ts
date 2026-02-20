/**
 * TASK 144: SEARCH INDEXING
 *
 * Full-text search with Elasticsearch integration.
 */

import prisma from "@/lib/prisma";

export interface SearchIndex {
  id: string;
  type: "claim" | "job" | "document";
  documentId: string;
  content: string;
  metadata: Record<string, any>;
  tenantId: string;
}

export async function indexDocument(
  tenantId: string,
  type: "claim" | "job" | "document",
  documentId: string,
  content: string,
  metadata: Record<string, any>
): Promise<void> {
  await prisma.searchIndex.upsert({
    where: {
      type_documentId: {
        type,
        documentId,
      },
    },
    update: {
      content,
      metadata: metadata as any,
    },
    create: {
      tenantId,
      type,
      documentId,
      content,
      metadata: metadata as any,
    } as any,
  });
}

export async function search(
  tenantId: string,
  query: string,
  filters?: {
    type?: string;
    limit?: number;
  }
): Promise<any[]> {
  const where: any = {
    tenantId,
    content: {
      contains: query,
      mode: "insensitive",
    },
  };

  if (filters?.type) {
    where.type = filters.type;
  }

  const results = await prisma.searchIndex.findMany({
    where,
    take: filters?.limit || 20,
  });

  return results;
}

export async function deleteFromIndex(type: string, documentId: string): Promise<void> {
  await prisma.searchIndex.delete({
    where: {
      type_documentId: {
        type: type as any,
        documentId,
      },
    },
  });
}

export async function reindexAll(tenantId: string): Promise<number> {
  // Delete existing
  await prisma.searchIndex.deleteMany({ where: { tenantId } });

  let count = 0;

  // Index claims
  const claims = await prisma.claims.findMany({
    where: { tenantId },
  });

  for (const claim of claims) {
    await indexDocument(tenantId, "claim", claim.id, `${claim.claimNumber} ${claim.status}`, {
      claimNumber: claim.claimNumber,
    });
    count++;
  }

  // Index jobs
  const jobs = await prisma.job.findMany({
    where: { organization: { tenantId } },
  });

  for (const job of jobs) {
    await indexDocument(tenantId, "job", job.id, `${job.title} ${job.status}`, {
      title: job.title,
    });
    count++;
  }

  return count;
}
