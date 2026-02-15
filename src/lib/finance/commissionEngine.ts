/**
 * Commission Rule Engine
 *
 * Supports all roofing industry commission structures:
 * - percentage_revenue: 10% of contract value (10/50, 10/60, 10/70)
 * - profit_share: % of gross profit after overhead
 * - tiered: graduated rates based on revenue thresholds
 * - flat_bonus: fixed $ per approved claim or milestone
 * - hybrid: base rate + bonus tiers + profit share combo
 */

// ── Types ───────────────────────────────────────────────────────────────────

export interface CommissionPlan {
  id: string;
  orgId: string;
  name: string;
  ruleType: RuleType;
  structure: RuleStructure;
  isActive: boolean;
  isDefault: boolean;
}

export type RuleType = "percentage_revenue" | "profit_share" | "tiered" | "flat_bonus" | "hybrid";

export interface PercentageRevenueRule {
  rate: number; // e.g. 0.10 = 10%
}

export interface ProfitShareRule {
  rate: number; // e.g. 0.50 = 50% of gross profit
  overheadPct: number; // e.g. 0.40 = 40% overhead deducted first
}

export interface TieredRule {
  tiers: Array<{
    min: number;
    max: number | null; // null = unlimited
    rate: number;
  }>;
}

export interface FlatBonusRule {
  amount: number; // fixed $ amount
  trigger: "claim_approved" | "job_completed" | "payment_received";
}

export interface HybridRule {
  baseRate: number;
  profitShareRate?: number;
  bonusTiers?: Array<{
    min: number;
    max: number | null;
    bonus: number;
  }>;
}

export type RuleStructure =
  | PercentageRevenueRule
  | ProfitShareRule
  | TieredRule
  | FlatBonusRule
  | HybridRule;

export interface JobFinancialInput {
  jobId: string;
  contractAmount: number;
  supplementAmount: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  otherCost: number;
}

export interface CommissionResult {
  commissionAmount: number;
  baseAmount: number;
  ruleType: RuleType;
  calculation: CommissionBreakdown;
}

export interface CommissionBreakdown {
  ruleType: RuleType;
  inputs: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
  };
  steps: Array<{
    description: string;
    amount: number;
  }>;
  finalAmount: number;
}

// ── Engine ──────────────────────────────────────────────────────────────────

export function processCommission(
  plan: CommissionPlan,
  financials: JobFinancialInput
): CommissionResult {
  const totalRevenue = financials.contractAmount + financials.supplementAmount;
  const totalCost =
    financials.materialCost + financials.laborCost + financials.overheadCost + financials.otherCost;
  const grossProfit = totalRevenue - totalCost;

  const inputs = { totalRevenue, totalCost, grossProfit };

  switch (plan.ruleType) {
    case "percentage_revenue":
      return calcPercentageRevenue(plan.structure as PercentageRevenueRule, inputs);
    case "profit_share":
      return calcProfitShare(plan.structure as ProfitShareRule, inputs);
    case "tiered":
      return calcTiered(plan.structure as TieredRule, inputs);
    case "flat_bonus":
      return calcFlatBonus(plan.structure as FlatBonusRule, inputs);
    case "hybrid":
      return calcHybrid(plan.structure as HybridRule, inputs);
    default:
      throw new Error(`Unknown rule type: ${plan.ruleType}`);
  }
}

// ── Calculators ─────────────────────────────────────────────────────────────

function calcPercentageRevenue(
  rule: PercentageRevenueRule,
  inputs: { totalRevenue: number; totalCost: number; grossProfit: number }
): CommissionResult {
  const amount = round(inputs.totalRevenue * rule.rate);
  return {
    commissionAmount: amount,
    baseAmount: inputs.totalRevenue,
    ruleType: "percentage_revenue",
    calculation: {
      ruleType: "percentage_revenue",
      inputs,
      steps: [
        {
          description: `${(rule.rate * 100).toFixed(1)}% of $${inputs.totalRevenue.toLocaleString()} revenue`,
          amount,
        },
      ],
      finalAmount: amount,
    },
  };
}

function calcProfitShare(
  rule: ProfitShareRule,
  inputs: { totalRevenue: number; totalCost: number; grossProfit: number }
): CommissionResult {
  // Calculate overhead deduction first
  const overheadDeduction = round(inputs.totalRevenue * rule.overheadPct);
  const adjustedProfit = Math.max(0, inputs.totalRevenue - inputs.totalCost - overheadDeduction);
  const amount = round(adjustedProfit * rule.rate);

  return {
    commissionAmount: amount,
    baseAmount: adjustedProfit,
    ruleType: "profit_share",
    calculation: {
      ruleType: "profit_share",
      inputs,
      steps: [
        {
          description: `Overhead: ${(rule.overheadPct * 100).toFixed(0)}% of $${inputs.totalRevenue.toLocaleString()} = -$${overheadDeduction.toLocaleString()}`,
          amount: -overheadDeduction,
        },
        {
          description: `Adjusted profit: $${adjustedProfit.toLocaleString()}`,
          amount: adjustedProfit,
        },
        {
          description: `${(rule.rate * 100).toFixed(0)}% profit share = $${amount.toLocaleString()}`,
          amount,
        },
      ],
      finalAmount: amount,
    },
  };
}

function calcTiered(
  rule: TieredRule,
  inputs: { totalRevenue: number; totalCost: number; grossProfit: number }
): CommissionResult {
  let remaining = inputs.totalRevenue;
  let total = 0;
  const steps: Array<{ description: string; amount: number }> = [];

  for (const tier of rule.tiers) {
    if (remaining <= 0) break;
    const tierMax = tier.max ?? Infinity;
    const tierRange = tierMax - tier.min;
    const applicable = Math.min(remaining, tierRange);
    const tierAmount = round(applicable * tier.rate);

    steps.push({
      description: `$${tier.min.toLocaleString()}–$${tier.max ? tier.max.toLocaleString() : "∞"} @ ${(tier.rate * 100).toFixed(1)}% = $${tierAmount.toLocaleString()}`,
      amount: tierAmount,
    });

    total += tierAmount;
    remaining -= applicable;
  }

  return {
    commissionAmount: round(total),
    baseAmount: inputs.totalRevenue,
    ruleType: "tiered",
    calculation: {
      ruleType: "tiered",
      inputs,
      steps,
      finalAmount: round(total),
    },
  };
}

function calcFlatBonus(
  rule: FlatBonusRule,
  inputs: { totalRevenue: number; totalCost: number; grossProfit: number }
): CommissionResult {
  return {
    commissionAmount: rule.amount,
    baseAmount: inputs.totalRevenue,
    ruleType: "flat_bonus",
    calculation: {
      ruleType: "flat_bonus",
      inputs,
      steps: [
        {
          description: `Flat bonus on ${rule.trigger}: $${rule.amount.toLocaleString()}`,
          amount: rule.amount,
        },
      ],
      finalAmount: rule.amount,
    },
  };
}

function calcHybrid(
  rule: HybridRule,
  inputs: { totalRevenue: number; totalCost: number; grossProfit: number }
): CommissionResult {
  const steps: Array<{ description: string; amount: number }> = [];
  let total = 0;

  // Step 1: Base percentage
  const baseAmount = round(inputs.totalRevenue * rule.baseRate);
  steps.push({
    description: `Base: ${(rule.baseRate * 100).toFixed(1)}% of $${inputs.totalRevenue.toLocaleString()} = $${baseAmount.toLocaleString()}`,
    amount: baseAmount,
  });
  total += baseAmount;

  // Step 2: Profit share (if configured)
  if (rule.profitShareRate && inputs.grossProfit > 0) {
    const profitShare = round(inputs.grossProfit * rule.profitShareRate);
    steps.push({
      description: `Profit share: ${(rule.profitShareRate * 100).toFixed(0)}% of $${inputs.grossProfit.toLocaleString()} profit = $${profitShare.toLocaleString()}`,
      amount: profitShare,
    });
    total += profitShare;
  }

  // Step 3: Bonus tiers
  if (rule.bonusTiers) {
    for (const tier of rule.bonusTiers) {
      if (
        inputs.totalRevenue >= tier.min &&
        (tier.max === null || inputs.totalRevenue <= tier.max)
      ) {
        steps.push({
          description: `Bonus tier ($${tier.min.toLocaleString()}–$${tier.max ? tier.max.toLocaleString() : "∞"}): +$${tier.bonus.toLocaleString()}`,
          amount: tier.bonus,
        });
        total += tier.bonus;
      }
    }
  }

  return {
    commissionAmount: round(total),
    baseAmount: inputs.totalRevenue,
    ruleType: "hybrid",
    calculation: {
      ruleType: "hybrid",
      inputs,
      steps,
      finalAmount: round(total),
    },
  };
}

// ── Presets for common roofing commission structures ────────────────────────

export const COMMISSION_PRESETS: Record<
  string,
  { name: string; description: string; ruleType: RuleType; structure: RuleStructure }
> = {
  "10-50": {
    name: "10/50 Standard",
    description: "10% of revenue, company covers 50% overhead",
    ruleType: "profit_share",
    structure: { rate: 0.1, overheadPct: 0.5 } as ProfitShareRule,
  },
  "10-60": {
    name: "10/60 Mid-Tier",
    description: "10% of revenue, company covers 60% overhead",
    ruleType: "profit_share",
    structure: { rate: 0.1, overheadPct: 0.6 } as ProfitShareRule,
  },
  "10-70": {
    name: "10/70 Senior",
    description: "10% of revenue, company covers 70% overhead",
    ruleType: "profit_share",
    structure: { rate: 0.1, overheadPct: 0.7 } as ProfitShareRule,
  },
  "flat-10": {
    name: "Flat 10%",
    description: "10% of total contract revenue",
    ruleType: "percentage_revenue",
    structure: { rate: 0.1 } as PercentageRevenueRule,
  },
  "tiered-standard": {
    name: "Tiered Growth",
    description: "8% up to $50k, 10% to $150k, 12% above",
    ruleType: "tiered",
    structure: {
      tiers: [
        { min: 0, max: 50000, rate: 0.08 },
        { min: 50000, max: 150000, rate: 0.1 },
        { min: 150000, max: null, rate: 0.12 },
      ],
    } as TieredRule,
  },
  "hybrid-senior": {
    name: "Hybrid Senior Rep",
    description: "8% base + 5% profit share + volume bonuses",
    ruleType: "hybrid",
    structure: {
      baseRate: 0.08,
      profitShareRate: 0.05,
      bonusTiers: [
        { min: 100000, max: 250000, bonus: 1000 },
        { min: 250000, max: null, bonus: 2500 },
      ],
    } as HybridRule,
  },
  "claim-bonus": {
    name: "Per-Claim Bonus",
    description: "$500 per approved claim",
    ruleType: "flat_bonus",
    structure: {
      amount: 500,
      trigger: "claim_approved",
    } as FlatBonusRule,
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
