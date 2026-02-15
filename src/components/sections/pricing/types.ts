export type Money = number;

export type RetailLine = {
  id: string;
  label: string;
  qty: number;
  unit?: string;
  unitPrice: Money;
  taxExempt?: boolean;
  note?: string;
};

export type InsuranceLine = {
  id: string;
  roomOrArea?: string;
  scope: string;
  codeRef?: string;
  qty: number;
  unit: string;
  unitPrice: Money;
  wastePct?: number;
  note?: string;
};

export type RetailPricingState = {
  lines: RetailLine[];
  taxRatePct: number;
  includeOP: boolean;
  overheadPct: number;
  profitPct: number;
};

export type InsurancePricingState = {
  lines: InsuranceLine[];
  includeOP: boolean;
  overheadPct: number;
  profitPct: number;
};

export function dollars(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n || 0);
}
