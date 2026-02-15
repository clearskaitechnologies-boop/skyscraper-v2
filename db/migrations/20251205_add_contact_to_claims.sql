-- Migration: Add contactId foreign key to claims table
-- Purpose: Enable linking claims to contacts for better relationship tracking
-- Date: 2025-12-05

-- Add contactId column (nullable to allow existing claims without contacts)
ALTER TABLE claims
ADD COLUMN IF NOT EXISTS "contactId" TEXT;

-- Add foreign key constraint to contacts table
ALTER TABLE claims
ADD CONSTRAINT "claims_contactId_fkey" 
FOREIGN KEY ("contactId") 
REFERENCES contacts(id) 
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add index for faster contact-based queries
CREATE INDEX IF NOT EXISTS "idx_claims_contactId" ON claims("contactId");

-- Migration complete
-- Run with: psql "$DATABASE_URL" -f ./db/migrations/20251205_add_contact_to_claims.sql
