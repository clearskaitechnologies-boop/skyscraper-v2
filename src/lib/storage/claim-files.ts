// Storage helper for claim document/photo uploads
import { logger } from "@/lib/observability/logger";
import { getStorageClient } from "@/lib/storage/client";

export interface UploadClaimFileOptions {
  claimId: string;
  file: File | Blob;
  fileName: string;
  contentType?: string;
  folder?: string; // e.g., "photos", "documents", "reports"
}

export interface UploadClaimFileResult {
  url: string;
  storageKey: string;
  bucket: string;
}

/**
 * Uploads a file to Supabase storage for a specific claim.
 * Uses the "documents" bucket by default (adjust if your bucket name differs).
 *
 * @param options Upload configuration
 * @returns Public URL and storage key
 */
export async function uploadClaimFileToStorage(
  options: UploadClaimFileOptions
): Promise<UploadClaimFileResult> {
  const { claimId, file, fileName, contentType, folder = "photos" } = options;

  const supabase = getStorageClient();
  if (!supabase) {
    throw new Error("Storage not configured");
  }

  // Construct storage path: claims/{claimId}/{folder}/{timestamp}-{fileName}
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageKey = `claims/${claimId}/${folder}/${timestamp}-${sanitizedFileName}`;

  // Upload to storage (using "documents" bucket - adjust if needed)
  const bucket = "documents"; // Change to your actual bucket name if different

  const { data, error } = await supabase.storage.from(bucket).upload(storageKey, file, {
    contentType: contentType || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    logger.error("[uploadClaimFileToStorage] Upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    url: publicUrl,
    storageKey: data.path,
    bucket,
  };
}
