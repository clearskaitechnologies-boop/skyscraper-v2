/**
 * Scope Matrix Schema
 * Validation for AI-generated scope of work tables
 */

import { z } from "zod";

export const ScopeLineItemSchema = z.object({
  item: z.string().min(5).max(200),
  quantity: z.number().positive(),
  unit: z.string().max(50),
  unitPrice: z.number().nonnegative(),
  total: z.number().nonnegative(),
  category: z.enum(["roof", "siding", "gutters", "windows", "interior", "other"]).optional(),
  notes: z.string().max(500).optional(),
});

export const ScopeMatrixSchema = z.object({
  lineItems: z.array(ScopeLineItemSchema).min(1).max(200),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative().optional(),
  total: z.number().nonnegative(),
  notes: z.string().max(1000).optional(),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export type ScopeMatrix = z.infer<typeof ScopeMatrixSchema>;
export type ScopeLineItem = z.infer<typeof ScopeLineItemSchema>;
