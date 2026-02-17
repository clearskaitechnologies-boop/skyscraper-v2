/**
 * Worker Storage Helpers
 *
 * Utilities for worker processes to access Supabase storage.
 * Uses service role key for privileged access.
 */

import { getStorageClient } from "@/lib/storage/client";
import { SupabaseClient } from "@supabase/supabase-js";

// =============================================================================
// LAZY CLIENT ACCESS
// =============================================================================

function getClient(): SupabaseClient {
  const client = getStorageClient();
  if (!client) {
    throw new Error("Storage not configured");
  }
  return client;
}

// =============================================================================
// SIGNED URL GENERATION
// =============================================================================

/**
 * Generate signed read URL for a storage path
 *
 * @param path - Full storage path (e.g., "orgs/xxx/proposals/yyy/photos/zzz.jpg")
 * @param expiresInSeconds - URL expiration time (default: 60)
 * @returns Signed URL string
 */
export async function getSignedReadUrl(
  path: string,
  expiresInSeconds: number = 60
): Promise<string> {
  const supabase = getClient();
  const { data, error } = await supabase.storage
    .from("proposals")
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    throw new Error(`Failed to generate signed read URL: ${error.message}`);
  }

  if (!data?.signedUrl) {
    throw new Error("No signed URL returned from Supabase");
  }

  return data.signedUrl;
}

/**
 * Generate multiple signed read URLs in batch
 *
 * @param paths - Array of storage paths
 * @param expiresInSeconds - URL expiration time (default: 60)
 * @returns Array of signed URLs in same order as input
 */
export async function getSignedReadUrls(
  paths: string[],
  expiresInSeconds: number = 60
): Promise<string[]> {
  const results = await Promise.all(paths.map((path) => getSignedReadUrl(path, expiresInSeconds)));

  return results;
}

/**
 * Extract storage path from full image URL
 *
 * @param imageUrl - Full Supabase URL (https://xxx.supabase.co/storage/v1/object/public/proposals/path/to/file.jpg)
 * @returns Storage path (path/to/file.jpg)
 */
export function extractStoragePath(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/proposals/");

    if (pathParts.length < 2) {
      throw new Error("Invalid Supabase storage URL format");
    }

    return pathParts[1];
  } catch (error: any) {
    throw new Error(`Failed to extract storage path: ${error.message}`);
  }
}
