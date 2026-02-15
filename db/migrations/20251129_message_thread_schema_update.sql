-- Migration: Update MessageThread schema for Phase 3
-- Date: 2025-11-29
-- Description: Add org, claim, trade partner, and client scoping to message threads

-- Add new columns to MessageThread
ALTER TABLE "MessageThread" 
  ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "claimId" TEXT,
  ADD COLUMN IF NOT EXISTS "tradePartnerId" TEXT,
  ADD COLUMN IF NOT EXISTS "clientId" TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "MessageThread_orgId_idx" ON "MessageThread"("orgId");
CREATE INDEX IF NOT EXISTS "MessageThread_claimId_idx" ON "MessageThread"("claimId");
CREATE INDEX IF NOT EXISTS "MessageThread_tradePartnerId_idx" ON "MessageThread"("tradePartnerId");
CREATE INDEX IF NOT EXISTS "MessageThread_clientId_idx" ON "MessageThread"("clientId");

-- Update Message table schema
ALTER TABLE "Message"
  ALTER COLUMN "senderId" RENAME TO "senderUserId";

ALTER TABLE "Message"
  ADD COLUMN IF NOT EXISTS "senderType" TEXT NOT NULL DEFAULT 'pro',
  ADD COLUMN IF NOT EXISTS "body" TEXT;

-- Migrate content to body if needed
UPDATE "Message" SET "body" = "content" WHERE "body" IS NULL AND "content" IS NOT NULL;

-- Drop old content column after migration
ALTER TABLE "Message" DROP COLUMN IF EXISTS "content";

-- Add index for senderType
CREATE INDEX IF NOT EXISTS "Message_senderType_idx" ON "Message"("senderType");

-- Add comment
COMMENT ON TABLE "MessageThread" IS 'Phase 3: Updated to support org, claim, trade partner, and client scoping';
COMMENT ON TABLE "Message" IS 'Phase 3: Updated with senderUserId, senderType, and body fields';
