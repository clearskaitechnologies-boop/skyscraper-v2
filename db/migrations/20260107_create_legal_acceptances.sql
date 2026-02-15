-- Legal Acceptances Table
-- Tracks user agreement to legal documents
-- Version: 2026-01
-- Created: January 2026

CREATE TABLE IF NOT EXISTS "legal_acceptances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_acceptances_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint to prevent duplicate acceptances
CREATE UNIQUE INDEX IF NOT EXISTS "legal_acceptances_userId_documentId_version_key" 
    ON "legal_acceptances"("userId", "documentId", "version");

-- Create index for fast lookups by user
CREATE INDEX IF NOT EXISTS "legal_acceptances_userId_documentId_idx" 
    ON "legal_acceptances"("userId", "documentId");

COMMENT ON TABLE "legal_acceptances" IS 'Tracks user acceptance of legal documents for compliance and audit purposes';
COMMENT ON COLUMN "legal_acceptances"."userId" IS 'Clerk user ID';
COMMENT ON COLUMN "legal_acceptances"."documentId" IS 'Legal document identifier (e.g., tos, privacy, aup)';
COMMENT ON COLUMN "legal_acceptances"."version" IS 'Version of the document accepted (e.g., 2026-01)';
COMMENT ON COLUMN "legal_acceptances"."acceptedAt" IS 'Timestamp when user accepted the document';
