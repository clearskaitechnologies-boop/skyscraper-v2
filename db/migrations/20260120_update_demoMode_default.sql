-- Migration: Add and configure demoMode column
-- Created: 2026-01-20
-- Purpose: Add demoMode column that is ON by default for all orgs

-- Add demoMode column if it doesn't exist (default to true)
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "demoMode" BOOLEAN DEFAULT true;

-- Add demoSeededAt column if it doesn't exist
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "demoSeededAt" TIMESTAMP(3);

-- Set demoMode = true for all existing orgs (they get demo mode by default)
UPDATE "Org" SET "demoMode" = true WHERE "demoMode" IS NULL;

-- Note: This migration does NOT seed demo data automatically.
-- Users can trigger demo seeding from the Admin Dashboard.
