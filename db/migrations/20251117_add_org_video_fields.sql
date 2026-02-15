-- Phase 31: Add video access control fields to Org model
-- Migration: Add videoEnabled and videoPlanTier columns

ALTER TABLE "Org" 
ADD COLUMN IF NOT EXISTS "videoEnabled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "videoPlanTier" TEXT;

-- Enable video for first org (beta access)
UPDATE "Org" 
SET "videoEnabled" = true, "videoPlanTier" = 'beta' 
WHERE "clerkOrgId" = (
  SELECT "clerkOrgId" 
  FROM "Org" 
  WHERE "clerkOrgId" IS NOT NULL 
  LIMIT 1
);

-- Verify
SELECT "clerkOrgId", name, "videoEnabled", "videoPlanTier" 
FROM "Org" 
WHERE "videoEnabled" = true;
