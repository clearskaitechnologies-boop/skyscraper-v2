import { InsuranceLine,InsurancePricingState, RetailLine, RetailPricingState } from "./types";

export function subtotalRetail(lines: RetailLine[]) {
  return lines.reduce((s, l) => s + l.qty * (l.unitPrice || 0), 0);
}

export function taxRetail(lines: RetailLine[], taxRatePct: number) {
  const taxable = lines.reduce((s, l) => s + (l.taxExempt ? 0 : l.qty * (l.unitPrice || 0)), 0);
  return taxable * (taxRatePct / 100);
}

export function opAmount(includeOP: boolean, overheadPct: number, profitPct: number, base: number) {
  if (!includeOP) return 0;
  const o = base * (overheadPct / 100);
  const p = (base + o) * (profitPct / 100);
  return o + p;
}

export function totalRetail(state: RetailPricingState) {
  const sub = subtotalRetail(state.lines);
  const tax = taxRetail(state.lines, state.taxRatePct);
  const op = opAmount(state.includeOP, state.overheadPct, state.profitPct, sub + tax);
  return { sub, tax, op, total: sub + tax + op };
}

export function subtotalInsurance(lines: InsuranceLine[]) {
  return lines.reduce((s, l) => {
    const qty = l.qty * (1 + (l.wastePct || 0) / 100);
    return s + qty * (l.unitPrice || 0);
  }, 0);
}

export function totalInsurance(state: InsurancePricingState) {
  const sub = subtotalInsurance(state.lines);
  const op = opAmount(state.includeOP, state.overheadPct, state.profitPct, sub);
  return { sub, op, total: sub + op };
}
