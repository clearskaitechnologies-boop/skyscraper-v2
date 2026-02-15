/**
 * Estimate Builder - Generate estimates
 * Stub file for legacy imports
 */

export interface EstimateResult {
  total: number;
  lineItems: any[];
}

/**
 * Generate estimate
 * @deprecated Use estimate AI functions instead
 */
export async function generateEstimate(claim_id: string): Promise<EstimateResult> {
  console.warn('generateEstimate is deprecated');
  return {
    total: 0,
    lineItems: []
  };
}
