-- Migration: Add Certificate Signing Fields
-- Date: 2025-01-21
-- Description: Adds fields to claims table for tracking certificate of completion signatures
--              and creates a table for storing signed documents with signatures

-- Add certification signing fields to claims table
ALTER TABLE claims ADD COLUMN IF NOT EXISTS "certificationSignedAt" TIMESTAMPTZ;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS "certificationSignedBy" VARCHAR(255);

-- Create signed_documents table for storing signatures and signed PDFs
CREATE TABLE IF NOT EXISTS signed_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "claimId" VARCHAR(255) NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    "orgId" VARCHAR(255) NOT NULL,
    name VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'COMPLETION_CERTIFICATE_SIGNED', 'INVOICE_SIGNED', etc.
    "signatureDataUrl" TEXT, -- Base64 encoded signature image
    "pdfUrl" TEXT, -- URL to stored signed PDF
    "signedBy" VARCHAR(255),
    "signedAt" TIMESTAMPTZ,
    "uploadedBy" VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for signed_documents
CREATE INDEX IF NOT EXISTS idx_signed_documents_claim ON signed_documents("claimId");
CREATE INDEX IF NOT EXISTS idx_signed_documents_org ON signed_documents("orgId");
CREATE INDEX IF NOT EXISTS idx_signed_documents_type ON signed_documents(type);

-- Add comment
COMMENT ON TABLE signed_documents IS 'Stores signed documents including Certificate of Completion and invoices with signature data';
