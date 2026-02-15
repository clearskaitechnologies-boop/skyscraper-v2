// src/types/xactimate.ts

export type XactimateLineItem = {
  id?: string; // local ID for React
  code: string; // e.g. RFG+IWS
  description: string;
  category?: string; // Roofing, Gutters, Paint, etc.
  roomArea?: string; // Roof - Main, Elevation A, etc.

  quantity: number;
  unit: string; // SQ, LF, EA, SF
  unitPrice: number;

  taxable: boolean;
  opEligible: boolean; // Overhead & Profit
};
