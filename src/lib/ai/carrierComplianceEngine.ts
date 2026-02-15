/**
 * PHASE 41: Carrier Compliance Engine
 * 
 * Analyzes contractor scope against carrier-specific rules
 * Generates carrier-friendly adjusted scopes
 * Flags conflicts and provides recommendations
 */

import { type CarrierRule } from "./carrierRules";

export interface ScopeLineItem {
  code: string;
  description: string;
  quantity: number;
  unit: string; // "SQ", "LF", "EA"
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

export interface ComplianceConflict {
  type: "missing_required" | "denied_item" | "exceeds_limit" | "waste_violation" | "op_denied" | "code_upgrade_issue";
  severity: "critical" | "warning" | "info";
  itemCode?: string;
  itemDescription: string;
  reason: string;
  recommendation: string;
  carrierNote?: string;
}

export interface CarrierFriendlyAdjustment {
  originalItem: ScopeLineItem;
  adjustedItem: ScopeLineItem;
  changeReason: string;
  carrierCompliant: boolean;
}

export interface ComplianceSummary {
  overallCompliance: "approved" | "needs_revision" | "likely_denied";
  confidenceScore: number; // 0-100
  criticalIssues: number;
  warnings: number;
  requiredCorrections: ComplianceConflict[];
  optionalEnhancements: ComplianceConflict[];
  carrierNotes: string[];
  estimatedApprovalChance: number; // 0-100
}

/**
 * Analyze scope for carrier-specific conflicts
 */
export function analyzeScopeForCarrierConflicts(
  scope: ScopeLineItem[],
  rules: CarrierRule
): ComplianceConflict[] {
  const conflicts: ComplianceConflict[] = [];

  // Check required items
  for (const requiredCode of rules.requiredItems) {
    const hasItem = scope.some(item => item.code === requiredCode);
    if (!hasItem) {
      conflicts.push({
        type: "missing_required",
        severity: "critical",
        itemCode: requiredCode,
        itemDescription: getItemDescription(requiredCode),
        reason: `${rules.carrierName} requires this item on all claims`,
        recommendation: `Add ${getItemDescription(requiredCode)} to scope`,
        carrierNote: rules.notes.find(n => n.includes(requiredCode)),
      });
    }
  }

  // Check denied items
  for (const item of scope) {
    if (rules.deniedItems.includes(item.code)) {
      conflicts.push({
        type: "denied_item",
        severity: "critical",
        itemCode: item.code,
        itemDescription: item.description,
        reason: `${rules.carrierName} commonly denies this item`,
        recommendation: `Remove ${item.description} or provide exceptional justification`,
        carrierNote: rules.notes.find(n => n.toLowerCase().includes(item.description.toLowerCase())),
      });
    }
  }

  // Check line item price limits
  for (const limit of rules.lineItemLimits) {
    const [code, maxSpec] = limit.split(" <= ");
    const [maxPriceStr, unit] = maxSpec.split("/");
    const maxPrice = parseFloat(maxPriceStr);

    const item = scope.find(s => s.code === code);
    if (item && item.unitPrice > maxPrice) {
      conflicts.push({
        type: "exceeds_limit",
        severity: "warning",
        itemCode: item.code,
        itemDescription: item.description,
        reason: `Unit price $${item.unitPrice}/${item.unit} exceeds ${rules.carrierName} limit of $${maxPrice}/${unit}`,
        recommendation: `Reduce unit price to $${maxPrice}/${unit} or provide market rate justification`,
      });
    }
  }

  // Check waste factor
  const wasteItem = scope.find(item => 
    item.description.toLowerCase().includes("waste") || 
    item.code.includes("WASTE")
  );
  
  if (wasteItem && rules.wasteLimitPercent) {
    const wastePercent = (wasteItem.quantity / scope.reduce((sum, s) => sum + s.quantity, 0)) * 100;
    if (wastePercent > rules.wasteLimitPercent) {
      conflicts.push({
        type: "waste_violation",
        severity: "critical",
        itemCode: wasteItem.code,
        itemDescription: "Waste factor",
        reason: `Waste factor ${wastePercent.toFixed(1)}% exceeds ${rules.carrierName} limit of ${rules.wasteLimitPercent}%`,
        recommendation: `Reduce waste factor to ${rules.wasteLimitPercent}% or less`,
        carrierNote: rules.notes.find(n => n.toLowerCase().includes("waste")),
      });
    }
  }

  // Check O&P allowance
  const opItem = scope.find(item => 
    item.description.toLowerCase().includes("overhead") || 
    item.description.toLowerCase().includes("profit") ||
    item.code.includes("O&P") ||
    item.code.includes("OP")
  );

  if (opItem && !rules.overheadProfitAllowed) {
    conflicts.push({
      type: "op_denied",
      severity: "critical",
      itemCode: opItem.code,
      itemDescription: "Overhead & Profit",
      reason: `${rules.carrierName} denies O&P without proof of general contractor supervision`,
      recommendation: "Remove O&P or provide subcontractor agreements and supervision documentation",
      carrierNote: rules.notes.find(n => n.toLowerCase().includes("o&p") || n.toLowerCase().includes("profit")),
    });
  }

  // Check ice and water shield
  const iceWaterItem = scope.find(item =>
    item.description.toLowerCase().includes("ice and water") ||
    item.description.toLowerCase().includes("ice & water") ||
    item.code === "RFG215"
  );

  if (iceWaterItem && !rules.allowsIceAndWater) {
    conflicts.push({
      type: "denied_item",
      severity: "warning",
      itemCode: iceWaterItem.code,
      itemDescription: "Ice and water shield",
      reason: `${rules.carrierName} often denies ice and water shield without proof of necessity`,
      recommendation: "Provide documentation of wind-driven rain damage or remove item",
      carrierNote: rules.notes.find(n => n.toLowerCase().includes("ice")),
    });
  }

  return conflicts;
}

/**
 * Generate carrier-friendly adjusted scope
 */
export function generateCarrierFriendlyScope(
  originalScope: ScopeLineItem[],
  rules: CarrierRule
): CarrierFriendlyAdjustment[] {
  const adjustments: CarrierFriendlyAdjustment[] = [];

  for (const item of originalScope) {
    let adjusted = { ...item };
    let needsAdjustment = false;
    let changeReason = "";

    // Adjust price if exceeds carrier limit
    for (const limit of rules.lineItemLimits) {
      const [code, maxSpec] = limit.split(" <= ");
      if (code === item.code) {
        const [maxPriceStr] = maxSpec.split("/");
        const maxPrice = parseFloat(maxPriceStr);
        
        if (item.unitPrice > maxPrice) {
          adjusted.unitPrice = maxPrice;
          adjusted.totalPrice = maxPrice * item.quantity;
          needsAdjustment = true;
          changeReason = `Adjusted to ${rules.carrierName} maximum allowable price of $${maxPrice}/${item.unit}`;
        }
      }
    }

    // Remove denied items
    if (rules.deniedItems.includes(item.code)) {
      adjusted.quantity = 0;
      adjusted.totalPrice = 0;
      needsAdjustment = true;
      changeReason = `Removed - commonly denied by ${rules.carrierName}`;
    }

    // Adjust O&P if not allowed
    if (!rules.overheadProfitAllowed && 
        (item.description.toLowerCase().includes("overhead") || 
         item.description.toLowerCase().includes("profit"))) {
      adjusted.quantity = 0;
      adjusted.totalPrice = 0;
      needsAdjustment = true;
      changeReason = `Removed - ${rules.carrierName} denies O&P without GC supervision proof`;
    }

    if (needsAdjustment) {
      adjustments.push({
        originalItem: item,
        adjustedItem: adjusted,
        changeReason,
        carrierCompliant: true,
      });
    }
  }

  // Add missing required items
  for (const requiredCode of rules.requiredItems) {
    const hasItem = originalScope.some(item => item.code === requiredCode);
    if (!hasItem) {
      const newItem: ScopeLineItem = {
        code: requiredCode,
        description: getItemDescription(requiredCode),
        quantity: estimateQuantity(requiredCode, originalScope),
        unit: getItemUnit(requiredCode),
        unitPrice: getEstimatedPrice(requiredCode),
        totalPrice: 0,
      };
      newItem.totalPrice = newItem.quantity * newItem.unitPrice;

      adjustments.push({
        originalItem: { ...newItem, quantity: 0, totalPrice: 0 },
        adjustedItem: newItem,
        changeReason: `Added - required by ${rules.carrierName}`,
        carrierCompliant: true,
      });
    }
  }

  return adjustments;
}

/**
 * Generate compliance summary with recommendations
 */
export function generateComplianceSummary(
  scope: ScopeLineItem[],
  rules: CarrierRule
): ComplianceSummary {
  const conflicts = analyzeScopeForCarrierConflicts(scope, rules);
  
  const criticalIssues = conflicts.filter(c => c.severity === "critical").length;
  const warnings = conflicts.filter(c => c.severity === "warning").length;

  const requiredCorrections = conflicts.filter(c => c.severity === "critical");
  const optionalEnhancements = conflicts.filter(c => c.severity === "warning" || c.severity === "info");

  // Calculate approval chance
  let approvalChance = 100;
  approvalChance -= criticalIssues * 20; // Each critical issue reduces chance by 20%
  approvalChance -= warnings * 5; // Each warning reduces chance by 5%
  approvalChance = Math.max(0, Math.min(100, approvalChance));

  // Determine overall compliance
  let overallCompliance: "approved" | "needs_revision" | "likely_denied";
  if (criticalIssues === 0 && warnings <= 1) {
    overallCompliance = "approved";
  } else if (criticalIssues <= 2) {
    overallCompliance = "needs_revision";
  } else {
    overallCompliance = "likely_denied";
  }

  // Confidence score based on rule coverage
  const confidenceScore = Math.min(95, 60 + (rules.lineItemLimits.length * 5));

  return {
    overallCompliance,
    confidenceScore,
    criticalIssues,
    warnings,
    requiredCorrections,
    optionalEnhancements,
    carrierNotes: rules.notes,
    estimatedApprovalChance: approvalChance,
  };
}

/**
 * Helper: Get item description by code
 */
function getItemDescription(code: string): string {
  const descriptions: Record<string, string> = {
    RFG330: "Starter strip shingles",
    RFG410: "Drip edge",
    RFG210: "Underlayment (felt)",
    RFG215: "Ice and water shield",
    RFG220: "Architectural shingles",
    RFG110: "3-tab shingles",
  };
  return descriptions[code] || "Unknown item";
}

/**
 * Helper: Get item unit
 */
function getItemUnit(code: string): string {
  const units: Record<string, string> = {
    RFG330: "LF",
    RFG410: "LF",
    RFG210: "SQ",
    RFG215: "SQ",
    RFG220: "SQ",
    RFG110: "SQ",
  };
  return units[code] || "EA";
}

/**
 * Helper: Estimate quantity for required item
 */
function estimateQuantity(code: string, existingScope: ScopeLineItem[]): number {
  // Estimate based on existing scope quantities
  const totalSQ = existingScope
    .filter(item => item.unit === "SQ")
    .reduce((sum, item) => sum + item.quantity, 0);

  if (code === "RFG330" || code === "RFG410") {
    // Starter and drip edge: estimate from perimeter
    return Math.ceil(totalSQ * 4.5); // Rough estimate: ~4.5 LF per SQ
  }

  return totalSQ || 10; // Default fallback
}

/**
 * Helper: Get estimated price for item
 */
function getEstimatedPrice(code: string): number {
  const prices: Record<string, number> = {
    RFG330: 10,
    RFG410: 7,
    RFG210: 25,
    RFG215: 40,
    RFG220: 325,
    RFG110: 225,
  };
  return prices[code] || 0;
}
