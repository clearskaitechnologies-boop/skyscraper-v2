/**
 * Job Document Management
 *
 * Link and organize documents to jobs
 * Categorization, versioning, quick access
 */

import { logActivity } from "@/lib/activity/activityFeed";
import prisma from "@/lib/prisma";
import { notifyNewDocument } from "@/lib/websocket/pipelineSync";

export type DocumentCategory =
  | "ESTIMATE"
  | "CONTRACT"
  | "INVOICE"
  | "PHOTO"
  | "REPORT"
  | "INSURANCE"
  | "PERMIT"
  | "INSPECTION"
  | "SUPPLEMENT"
  | "OTHER";

export interface JobDocument {
  id: string;
  jobId: string;
  orgId: string;
  name: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  version: number;
  description?: string;
  uploadedBy: string;
  uploadedAt: Date;
  tags?: string[];
}

/**
 * Link document to job
 */
export async function linkDocumentToJob(
  orgId: string,
  jobId: string,
  documentId: string,
  category: DocumentCategory,
  userId: string
): Promise<void> {
  try {
    // Check if document exists
    const document = await prisma.documents.findFirst({
      where: { id: documentId, orgId },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    // Create link
    await prisma.jobDocuments
      .create({
        data: {
          jobId,
          documentId,
          orgId,
          category,
          createdBy: userId,
        },
      })
      .catch(() => {
        throw new Error("Failed to link document");
      });

    // Notify real-time
    await notifyNewDocument(orgId, "CLAIMS", jobId, documentId, document.name, userId);

    // Log activity
    await logActivity(orgId, {
      type: "NEW_DOCUMENT",
      userId,
      resourceType: "JOB",
      resourceId: jobId,
      action: "Document Added",
      description: document.name,
      metadata: { category },
    });
  } catch (error) {
    console.error("Failed to link document:", error);
    throw error;
  }
}

/**
 * Upload and link document in one step
 */
export async function uploadJobDocument(
  orgId: string,
  jobId: string,
  data: {
    name: string;
    category: DocumentCategory;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    description?: string;
    tags?: string[];
  },
  userId: string
): Promise<JobDocument> {
  try {
    // Create document
    const document = await prisma.documents.create({
      data: {
        orgId,
        name: data.name,
        type: data.fileType,
        url: data.fileUrl,
        size: data.fileSize,
        description: data.description,
        uploadedBy: userId,
      },
    });

    // Link to job
    await prisma.jobDocuments.create({
      data: {
        jobId,
        documentId: document.id,
        orgId,
        category: data.category,
        createdBy: userId,
      },
    });

    // Notify real-time
    await notifyNewDocument(orgId, "CLAIMS", jobId, document.id, data.name, userId);

    // Log activity
    await logActivity(orgId, {
      type: "NEW_DOCUMENT",
      userId,
      resourceType: "JOB",
      resourceId: jobId,
      action: "Document Uploaded",
      description: data.name,
      metadata: { category: data.category },
    });

    return {
      id: document.id,
      jobId,
      orgId,
      name: data.name,
      category: data.category,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
      version: 1,
      description: data.description,
      uploadedBy: userId,
      uploadedAt: document.createdAt,
      tags: data.tags,
    };
  } catch (error) {
    console.error("Failed to upload job document:", error);
    throw error;
  }
}

/**
 * Get job documents
 */
export async function getJobDocuments(
  jobId: string,
  orgId: string,
  category?: DocumentCategory
): Promise<JobDocument[]> {
  try {
    const links = await prisma.jobDocuments.findMany({
      where: {
        jobId,
        orgId,
        ...(category && { category }),
      },
      include: {
        document: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return links.map((link) => ({
      id: link.document.id,
      jobId,
      orgId,
      name: link.document.name,
      category: link.category as DocumentCategory,
      fileUrl: link.document.url,
      fileType: link.document.type,
      fileSize: link.document.size,
      version: 1, // TODO: Implement versioning
      description: link.document.description || undefined,
      uploadedBy: link.document.uploadedBy,
      uploadedAt: link.document.createdAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Get documents by category
 */
export async function getDocumentsByCategory(
  jobId: string,
  orgId: string
): Promise<Record<DocumentCategory, JobDocument[]>> {
  const documents = await getJobDocuments(jobId, orgId);

  const byCategory: Record<string, JobDocument[]> = {};

  for (const doc of documents) {
    if (!byCategory[doc.category]) {
      byCategory[doc.category] = [];
    }
    byCategory[doc.category].push(doc);
  }

  return byCategory as Record<DocumentCategory, JobDocument[]>;
}

/**
 * Unlink document from job
 */
export async function unlinkDocument(
  jobId: string,
  documentId: string,
  orgId: string,
  userId: string
): Promise<void> {
  try {
    const link = await prisma.jobDocuments.findFirst({
      where: {
        jobId,
        documentId,
        orgId,
      },
      include: {
        document: true,
      },
    });

    if (!link) {
      throw new Error("Document link not found");
    }

    await prisma.jobDocuments.delete({
      where: { id: link.id },
    });

    // Log activity
    await logActivity(orgId, {
      type: "DELETED",
      userId,
      resourceType: "JOB",
      resourceId: jobId,
      action: "Document Removed",
      description: link.document.name,
    });
  } catch (error) {
    console.error("Failed to unlink document:", error);
    throw error;
  }
}

/**
 * Update document category
 */
export async function updateDocumentCategory(
  jobId: string,
  documentId: string,
  newCategory: DocumentCategory,
  orgId: string,
  userId: string
): Promise<void> {
  try {
    await prisma.jobDocuments.updateMany({
      where: {
        jobId,
        documentId,
        orgId,
      },
      data: {
        category: newCategory,
      },
    });

    // Log activity
    await logActivity(orgId, {
      type: "UPDATED",
      userId,
      resourceType: "JOB",
      resourceId: jobId,
      action: "Document Category Updated",
      description: `Changed to ${newCategory}`,
    });
  } catch (error) {
    console.error("Failed to update document category:", error);
    throw error;
  }
}

/**
 * Get document count by category
 */
export async function getDocumentStats(
  jobId: string,
  orgId: string
): Promise<Record<DocumentCategory, number>> {
  try {
    const documents = await getJobDocuments(jobId, orgId);

    const stats: Record<string, number> = {};

    for (const doc of documents) {
      stats[doc.category] = (stats[doc.category] || 0) + 1;
    }

    return stats as Record<DocumentCategory, number>;
  } catch {
    return {} as Record<DocumentCategory, number>;
  }
}

/**
 * Search job documents
 */
export async function searchJobDocuments(
  jobId: string,
  orgId: string,
  query: string
): Promise<JobDocument[]> {
  try {
    const documents = await getJobDocuments(jobId, orgId);

    const queryLower = query.toLowerCase();

    return documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(queryLower) ||
        doc.description?.toLowerCase().includes(queryLower) ||
        doc.category.toLowerCase().includes(queryLower)
    );
  } catch {
    return [];
  }
}
