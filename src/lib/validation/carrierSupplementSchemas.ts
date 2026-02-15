/**
 * PHASE 41-42: Input Validation Schemas
 * Comprehensive Zod schemas for carrier compliance and supplement generation
 */

import { z } from "zod";

// Scope line item validation
export const ScopeLineItemSchema = z.object({
  code: z.string().min(1, "Item code is required").max(50),
  description: z.string().min(1, "Description is required").max(500),
  quantity: z.number().min(0, "Quantity must be positive").max(999999),
  unit: z.string().min(1).max(20),
  unitPrice: z.number().min(0, "Unit price must be positive").max(999999),
  totalPrice: z.number().min(0, "Total price must be positive").max(9999999),
  category: z.string().max(100).optional(),
});

// Carrier compliance request validation
export const CarrierComplianceRequestSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required").max(100),
  scope: z.array(ScopeLineItemSchema)
    .min(1, "At least one scope item is required")
    .max(500, "Too many scope items (max 500)"),
  manualCarrier: z.string().max(100).optional(),
  adjusterEmail: z.string().email("Invalid email format").max(200).optional(),
  policyPDFText: z.string().max(50000, "PDF text too large").optional(),
});

// Supplement generation request validation  
export const SupplementRequestSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required").max(100),
  carrierScopePDF: z.string().max(100000, "PDF content too large (max 100KB)").optional(),
  carrierScopePDFUrl: z.string().url("Invalid PDF URL").max(500).optional(),
  contractorScope: z.array(ScopeLineItemSchema)
    .min(1, "Contractor scope is required")
    .max(500, "Too many scope items (max 500)"),
  adjusterEmail: z.string().email("Invalid email format").max(200).optional(),
  manualCarrier: z.string().max(100).optional(),
  zipCode: z.string().regex(/^\d{5}$/, "Invalid ZIP code").optional(),
  city: z.string().min(1).max(100).default("Phoenix"),
  state: z.string().min(2).max(50).default("Arizona"),
  tone: z.enum(["professional", "firm", "legal"]).default("professional"),
}).refine(
  (data) => data.carrierScopePDF || data.carrierScopePDFUrl,
  {
    message: "Either carrierScopePDF or carrierScopePDFUrl must be provided",
    path: ["carrierScopePDF"],
  }
);

// File upload validation
export const FileUploadSchema = z.object({
  file: z.instanceof(File, { message: "File is required" }),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB default
  allowedTypes: z.array(z.string()).default(["application/pdf"]),
}).refine(
  (data) => data.file.size <= data.maxSize,
  (data) => ({ message: `File size must be less than ${data.maxSize / 1024 / 1024}MB` })
).refine(
  (data) => data.allowedTypes.includes(data.file.type),
  (data) => ({ message: `File type must be one of: ${data.allowedTypes.join(", ")}` })
);

// Email validation for carrier detection
export const EmailDomainSchema = z.string()
  .email("Invalid email format")
  .refine(
    (email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      const knownCarriers = [
        "statefarm.com",
        "farmersinsurance.com",
        "farmers.com",
        "usaa.com",
        "allstate.com",
        "libertymutual.com",
        "nationwide.com",
      ];
      return knownCarriers.some(carrier => domain?.includes(carrier));
    },
    { message: "Email domain not recognized as a known carrier" }
  );

// Rate limit configuration
export const RateLimitConfig = {
  carrierCompliance: {
    limit: 20, // 20 requests
    window: 60 * 60, // per hour
  },
  supplementGeneration: {
    limit: 10, // 10 requests  
    window: 60 * 60, // per hour
  },
  pdfDownload: {
    limit: 50, // 50 downloads
    window: 60 * 60, // per hour
  },
};

// Security headers for file downloads
export const SecurityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};
