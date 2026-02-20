/**
 * Document Versioning
 *
 * Version control for documents with diff tracking
 * Maintain history, rollback capability, change tracking
 */

import { diff_match_patch } from "diff-match-patch";
import { logger } from "@/lib/logger";

import prisma from "@/lib/prisma";

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  content: string;
  diff?: string;
  changes: DocumentChange[];
  createdBy: string;
  createdAt: Date;
  comment?: string;
}

export interface DocumentChange {
  field: string;
  oldValue: any;
  newValue: any;
  type: "added" | "modified" | "deleted";
}

/**
 * Create document version
 */
export async function createDocumentVersion(
  documentId: string,
  content: string,
  userId: string,
  comment?: string
): Promise<DocumentVersion> {
  try {
    // Get latest version
    const latestVersion = await getLatestVersion(documentId);
    const versionNumber = latestVersion ? latestVersion.version + 1 : 1;

    // Calculate diff if there's a previous version
    let diffText: string | undefined;
    let changes: DocumentChange[] = [];

    if (latestVersion) {
      const dmp = new diff_match_patch();
      const diffs = dmp.diff_main(latestVersion.content, content);
      dmp.diff_cleanupSemantic(diffs);
      diffText = dmp.patch_toText(dmp.patch_make(diffs));

      changes = detectChanges(latestVersion.content, content);
    }

    // Store version
    const version = (await prisma.documentVersions.create({
      data: {
        documentId,
        version: versionNumber,
        content,
        diff: diffText,
        changes,
        createdBy: userId,
        comment,
      },
    })) as any;

    return version;
  } catch (error) {
    logger.error("Failed to create document version:", error);
    throw error;
  }
}

/**
 * Get document version history
 */
export async function getVersionHistory(
  documentId: string,
  limit: number = 50
): Promise<DocumentVersion[]> {
  try {
    const versions = await prisma.documentVersions.findMany({
      where: { documentId },
      orderBy: { version: "desc" },
      take: limit,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return versions as any[];
  } catch {
    return [];
  }
}

/**
 * Get latest version
 */
export async function getLatestVersion(documentId: string): Promise<DocumentVersion | null> {
  try {
    const version = await prisma.documentVersions.findFirst({
      where: { documentId },
      orderBy: { version: "desc" },
    });

    return version as any;
  } catch {
    return null;
  }
}

/**
 * Get specific version
 */
export async function getVersion(
  documentId: string,
  versionNumber: number
): Promise<DocumentVersion | null> {
  try {
    const version = await prisma.documentVersions.findFirst({
      where: {
        documentId,
        version: versionNumber,
      },
    });

    return version as any;
  } catch {
    return null;
  }
}

/**
 * Restore document to specific version
 */
export async function restoreVersion(
  documentId: string,
  versionNumber: number,
  userId: string
): Promise<boolean> {
  try {
    const version = await getVersion(documentId, versionNumber);

    if (!version) {
      return false;
    }

    // Create new version with restored content
    await createDocumentVersion(
      documentId,
      version.content,
      userId,
      `Restored to version ${versionNumber}`
    );

    // Update document with restored content
    await prisma.document.update({
      where: { id: documentId },
      data: {
        // content: version.content, // Uncomment if document has content field
        updatedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    logger.error("Failed to restore version:", error);
    return false;
  }
}

/**
 * Compare two versions
 */
export async function compareVersions(
  documentId: string,
  version1: number,
  version2: number
): Promise<{
  version1Content: string;
  version2Content: string;
  diff: string;
  changes: DocumentChange[];
} | null> {
  try {
    const [v1, v2] = await Promise.all([
      getVersion(documentId, version1),
      getVersion(documentId, version2),
    ]);

    if (!v1 || !v2) {
      return null;
    }

    // Generate diff
    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(v1.content, v2.content);
    dmp.diff_cleanupSemantic(diffs);
    const diffText = dmp.patch_toText(dmp.patch_make(diffs));

    // Detect changes
    const changes = detectChanges(v1.content, v2.content);

    return {
      version1Content: v1.content,
      version2Content: v2.content,
      diff: diffText,
      changes,
    };
  } catch (error) {
    logger.error("Failed to compare versions:", error);
    return null;
  }
}

/**
 * Detect changes between versions
 */
function detectChanges(oldContent: string, newContent: string): DocumentChange[] {
  const changes: DocumentChange[] = [];

  try {
    // Parse as JSON if possible
    const oldData = JSON.parse(oldContent);
    const newData = JSON.parse(newContent);

    // Compare objects
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      if (!(key in oldData)) {
        changes.push({
          field: key,
          oldValue: null,
          newValue: newData[key],
          type: "added",
        });
      } else if (!(key in newData)) {
        changes.push({
          field: key,
          oldValue: oldData[key],
          newValue: null,
          type: "deleted",
        });
      } else if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes.push({
          field: key,
          oldValue: oldData[key],
          newValue: newData[key],
          type: "modified",
        });
      }
    }
  } catch {
    // Not JSON, treat as text diff
    if (oldContent !== newContent) {
      changes.push({
        field: "content",
        oldValue: oldContent.substring(0, 100),
        newValue: newContent.substring(0, 100),
        type: "modified",
      });
    }
  }

  return changes;
}

/**
 * Get version changes summary
 */
export async function getVersionChanges(
  documentId: string,
  versionNumber: number
): Promise<DocumentChange[]> {
  try {
    const version = await getVersion(documentId, versionNumber);
    return version?.changes || [];
  } catch {
    return [];
  }
}

/**
 * Delete old versions (cleanup)
 */
export async function cleanupOldVersions(
  documentId: string,
  keepCount: number = 20
): Promise<number> {
  try {
    const versions = await prisma.documentVersions.findMany({
      where: { documentId },
      orderBy: { version: "desc" },
    });

    if (versions.length <= keepCount) {
      return 0;
    }

    const versionsToDelete = versions.slice(keepCount);
    const versionIds = versionsToDelete.map((v) => v.id);

    const result = await prisma.documentVersions.deleteMany({
      where: {
        id: { in: versionIds },
      },
    });

    return result.count;
  } catch {
    return 0;
  }
}

/**
 * Auto-version on save
 */
export async function autoVersion(
  documentId: string,
  newContent: string,
  userId: string,
  options?: {
    minChanges?: number;
    minTimeSinceLastVersion?: number; // milliseconds
  }
): Promise<DocumentVersion | null> {
  try {
    const latestVersion = await getLatestVersion(documentId);

    // Check if versioning is needed
    if (latestVersion) {
      // Check time since last version
      if (options?.minTimeSinceLastVersion) {
        const timeSince = Date.now() - latestVersion.createdAt.getTime();
        if (timeSince < options.minTimeSinceLastVersion) {
          return null; // Too soon
        }
      }

      // Check if content actually changed
      if (latestVersion.content === newContent) {
        return null; // No changes
      }

      // Check minimum changes threshold
      if (options?.minChanges) {
        const changes = detectChanges(latestVersion.content, newContent);
        if (changes.length < options.minChanges) {
          return null; // Not enough changes
        }
      }
    }

    // Create version
    return await createDocumentVersion(documentId, newContent, userId, "Auto-saved version");
  } catch (error) {
    logger.error("Auto-versioning failed:", error);
    return null;
  }
}

/**
 * Get version statistics
 */
export async function getVersionStats(documentId: string): Promise<{
  totalVersions: number;
  firstVersion: Date;
  lastVersion: Date;
  topContributors: Array<{ userId: string; count: number }>;
}> {
  try {
    const versions = await prisma.documentVersions.findMany({
      where: { documentId },
      orderBy: { version: "asc" },
    });

    if (versions.length === 0) {
      return {
        totalVersions: 0,
        firstVersion: new Date(),
        lastVersion: new Date(),
        topContributors: [],
      };
    }

    // Count by contributor
    const contributorCounts: Record<string, number> = {};
    for (const version of versions) {
      contributorCounts[version.createdBy] = (contributorCounts[version.createdBy] || 0) + 1;
    }

    const topContributors = Object.entries(contributorCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalVersions: versions.length,
      firstVersion: versions[0].createdAt,
      lastVersion: versions[versions.length - 1].createdAt,
      topContributors,
    };
  } catch {
    return {
      totalVersions: 0,
      firstVersion: new Date(),
      lastVersion: new Date(),
      topContributors: [],
    };
  }
}
