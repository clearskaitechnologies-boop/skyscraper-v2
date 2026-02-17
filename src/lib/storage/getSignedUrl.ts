/**
 * Document Storage & Access Control
 * Centralized utility for secure document URL generation
 */

import { logger } from "@/lib/observability/logger";
import { getStorageClient } from "@/lib/storage/client";

export interface GetSignedUrlOptions {
  path: string;
  expiresIn?: number; // seconds, default 24 hours
  download?: boolean;
}

/**
 * Generate a signed URL for secure document access
 * @param path - Storage path (e.g., "org_123/documents/proposal_xyz.pdf")
 * @param expiresIn - URL expiration in seconds (default: 86400 = 24 hours)
 * @param download - Force download vs inline display
 */
export async function getSignedUrl({
  path,
  expiresIn = 86400,
  download = false,
}: GetSignedUrlOptions): Promise<string> {
  const supabase = getStorageClient();
  if (!supabase) {
    throw new Error("Storage not configured");
  }
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, expiresIn, {
      download,
    });

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  if (!data?.signedUrl) {
    throw new Error("Signed URL generation returned empty");
  }

  return data.signedUrl;
}

/**
 * Generate multiple signed URLs in batch
 */
export async function getBatchSignedUrls(
  paths: string[],
  expiresIn: number = 86400
): Promise<Record<string, string>> {
  const results = await Promise.all(
    paths.map(async (path) => {
      try {
        const url = await getSignedUrl({ path, expiresIn });
        return { path, url };
      } catch (error) {
        logger.error(`Failed to sign ${path}:`, error);
        return { path, url: null };
      }
    })
  );

  return results.reduce(
    (acc, { path, url }) => {
      if (url) acc[path] = url;
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Check if user has access to document
 */
export async function canAccessDocument(
  userId: string,
  orgId: string,
  documentPath: string
): Promise<boolean> {
  // Document paths are structured as: org_[orgId]/[type]/[filename]
  const pathOrgId = documentPath.split("/")[0].replace("org_", "");

  // User must be in the same org
  return pathOrgId === orgId;
}

/**
 * Generate time-limited client portal URL
 * Shorter expiration for external client access
 */
export async function getClientPortalUrl(
  documentPath: string,
  expiresIn: number = 3600 // 1 hour default for clients
): Promise<string> {
  return getSignedUrl({
    path: documentPath,
    expiresIn,
    download: false,
  });
}
