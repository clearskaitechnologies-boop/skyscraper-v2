/**
 * Report Export Registry
 * DEPRECATED: reportExport model doesn't exist in schema.
 */

export interface CreateExportParams {
  claimId: string;
  orgId: string;
  type: "report" | "supplement" | "mockup";
  templateId?: string;
  orgTemplateId?: string;
  storagePath: string;
  storageUrl?: string;
  createdBy: string;
  metadata?: Record<string, any>;
}

/**
 * Create export record in database
 */
export async function createExportRecord(params: CreateExportParams) {
  // reportExport model doesn't exist in schema
  console.log("✅ EXPORT_RECORD_SKIPPED (model not available):", {
    type: params.type,
    claimId: params.claimId,
  });
  return null;
}

/**
 * Get all exports for a claim
 */
export async function getClaimExports(claimId: string, orgId: string) {
  // reportExport model doesn't exist in schema
  console.log(`[exportRegistry] Would get exports for claim ${claimId}`);
  return [];
}

/**
 * Get exports by type
 */
export async function getExportsByType(
  claimId: string,
  orgId: string,
  type: "report" | "supplement" | "mockup"
) {
  // reportExport model doesn't exist in schema
  console.log(`[exportRegistry] Would get exports by type ${type} for claim ${claimId}`);
  return [];
}
