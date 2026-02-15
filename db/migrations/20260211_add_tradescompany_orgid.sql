-- Migration: Fix schema drift — add all missing columns to trades tables
-- Root Cause: Prisma schema defined columns on tradesCompany and tradesCompanyMember
-- that were never created in the app DB schema. This caused ALL queries using
-- `include: { company: true }` on tradesCompanyMember to crash with P2022,
-- because Prisma generated SELECT with columns that PostgreSQL rejected.
-- The .catch(() => null) silently swallowed the errors.
-- Effects: trades profile page showed "Create your trades profile" CTA,
-- public profile API returned 500 "Internal server error",
-- find-a-pro page couldn't load contractors.
-- Applied: 2026-02-11

-- 1. Add missing orgId to tradesCompany
ALTER TABLE app."tradesCompany"
  ADD COLUMN IF NOT EXISTS "orgId" text;

-- 2. Add 8 missing columns to tradesCompanyMember
ALTER TABLE app."tradesCompanyMember"
  ADD COLUMN IF NOT EXISTS "licenseNumber" text,
  ADD COLUMN IF NOT EXISTS "licenseState" text,
  ADD COLUMN IF NOT EXISTS "businessEntityType" text,
  ADD COLUMN IF NOT EXISTS "isBonded" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isInsured" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "insurancePolicyNumber" text,
  ADD COLUMN IF NOT EXISTS "additionalNotes" text,
  ADD COLUMN IF NOT EXISTS "coverageTypes" text[] DEFAULT '{}';

-- 3. Link existing companies to orgs
UPDATE app."tradesCompany"
SET "orgId" = (
  SELECT "orgId"
  FROM app."tradesCompanyMember"
  WHERE "companyId" = app."tradesCompany".id
    AND "orgId" IS NOT NULL
  LIMIT 1
)
WHERE "orgId" IS NULL;
