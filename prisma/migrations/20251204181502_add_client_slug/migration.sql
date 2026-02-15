-- AlterTable contacts: Add slug and userId fields
-- This migration adds slug-based routing support to the contacts model
-- Note: contacts already has city, state, street; only adding slug and userId

-- Add slug column with unique constraint
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Add userId column with unique constraint for Clerk integration
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS "contacts_slug_key" ON "contacts"("slug");

-- Create unique index on userId
CREATE UNIQUE INDEX IF NOT EXISTS "contacts_userId_key" ON "contacts"("userId");

-- Generate slugs for existing contacts (c-{cuid})
-- Note: This generates deterministic slugs from contact id
UPDATE "contacts" SET "slug" = 'c-' || substring(md5("id"), 1, 24) 
WHERE "slug" IS NULL;

-- Make slug column required after populating existing rows
ALTER TABLE "contacts" ALTER COLUMN "slug" SET NOT NULL;
