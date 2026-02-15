-- Fix Client table to match Prisma schema
-- Run with: psql $DATABASE_URL -f this_file.sql

-- Make name and email nullable (Prisma has them as optional)
ALTER TABLE "Client" ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE "Client" ALTER COLUMN "email" DROP NOT NULL;

-- Rename zip to postal if needed
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Client' AND column_name = 'zip') THEN
    ALTER TABLE "Client" RENAME COLUMN "zip" TO "postal";
  END IF;
END $$;

-- Add missing columns from Prisma schema
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Homeowner';
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "propertyPhotoUrl" TEXT;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "preferredContact" TEXT DEFAULT 'email';
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "notifyEmail" BOOLEAN DEFAULT true;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "notifySms" BOOLEAN DEFAULT false;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active';
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Client_status_idx" ON "Client"("status");
CREATE INDEX IF NOT EXISTS "Client_category_idx" ON "Client"("category");
