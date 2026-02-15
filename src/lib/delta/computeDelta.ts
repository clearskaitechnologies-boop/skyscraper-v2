/**
 * Delta Detection Engine
 *
 * Compares adjuster estimates vs contractor scope to identify variances.
 * DETERMINISTIC ONLY - no AI math. AI writes narrative around computed deltas.
 */

export type ScopeLineItem = {
  code?: string;
  description: string;
  qty: number;
  unit?: string;
  unitPrice: number;
  total: number;
};

export type VarianceKind = "MISSING" | "UNDERPAID" | "QTY_MISMATCH" | "SCOPE_MISMATCH";
export type VarianceSeverity = "low" | "medium" | "high";

export type Variance = {
  kind: VarianceKind;
  description: string;
  adjuster?: ScopeLineItem;
  contractor?: ScopeLineItem;
  deltaTotal: number;
  severity: VarianceSeverity;
};

/**
 * Normalize description for fuzzy matching
 */
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Determine severity based on delta amount
 */
function calculateSeverity(delta: number): VarianceSeverity {
  const absDelta = Math.abs(delta);
  if (absDelta > 2000) return "high";
  if (absDelta > 500) return "medium";
  return "low";
}

/**
 * Compute delta between adjuster estimate and contractor scope
 *
 * Returns sorted list of variances (highest delta first)
 */
export function computeDelta(
  adjusterScope: ScopeLineItem[],
  contractorScope: ScopeLineItem[]
): Variance[] {
  const variances: Variance[] = [];

  // Build normalized maps for lookup
  const adjusterMap = new Map<string, ScopeLineItem>(
    adjusterScope.map((item) => [normalize(item.description), item])
  );
  const contractorMap = new Map<string, ScopeLineItem>(
    contractorScope.map((item) => [normalize(item.description), item])
  );

  // Check contractor items against adjuster
  contractorMap.forEach((contractorItem, normalizedKey) => {
    const adjusterItem = adjusterMap.get(normalizedKey);

    // Case 1: MISSING - contractor has it, adjuster doesn't
    if (!adjusterItem) {
      variances.push({
        kind: "MISSING",
        description: contractorItem.description,
        contractor: contractorItem,
        deltaTotal: contractorItem.total,
        severity: calculateSeverity(contractorItem.total),
      });
      return;
    }

    // Case 2: QTY_MISMATCH - quantities differ
    if (adjusterItem.qty !== contractorItem.qty) {
      const delta = contractorItem.total - adjusterItem.total;
      variances.push({
        kind: "QTY_MISMATCH",
        description: contractorItem.description,
        adjuster: adjusterItem,
        contractor: contractorItem,
        deltaTotal: delta,
        severity: calculateSeverity(delta),
      });
    }

    // Case 3: UNDERPAID - adjuster unit price lower than contractor
    if (adjusterItem.unitPrice < contractorItem.unitPrice) {
      const delta = contractorItem.total - adjusterItem.total;
      variances.push({
        kind: "UNDERPAID",
        description: contractorItem.description,
        adjuster: adjusterItem,
        contractor: contractorItem,
        deltaTotal: delta,
        severity: calculateSeverity(delta),
      });
    }
  });

  // Sort by delta (highest first)
  return variances.sort((a, b) => b.deltaTotal - a.deltaTotal);
}

/**
 * Compute total delta amount
 */
export function computeTotalDelta(variances: Variance[]): number {
  return variances.reduce((sum, v) => sum + v.deltaTotal, 0);
}

/**
 * Compute summary statistics
 */
export function computeDeltaStats(variances: Variance[]) {
  return {
    totalVariances: variances.length,
    totalDelta: computeTotalDelta(variances),
    highSeverity: variances.filter((v) => v.severity === "high").length,
    mediumSeverity: variances.filter((v) => v.severity === "medium").length,
    lowSeverity: variances.filter((v) => v.severity === "low").length,
    missingItems: variances.filter((v) => v.kind === "MISSING").length,
    underpaidItems: variances.filter((v) => v.kind === "UNDERPAID").length,
    qtyMismatches: variances.filter((v) => v.kind === "QTY_MISMATCH").length,
  };
}

// Alias for backwards compatibility
export const computeVariances = computeDelta;
