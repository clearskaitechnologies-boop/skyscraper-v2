-- PHASE 3: Add onboarding & branding completion tracking to organizations
-- Enables proper initialization flow and dashboard banner logic

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS "brandingCompleted" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN DEFAULT false;

COMMENT ON COLUMN organizations."brandingCompleted" IS 'Tracks if company branding has been saved (Step 1 complete)';
COMMENT ON COLUMN organizations."onboardingCompleted" IS 'Tracks if onboarding wizard has been completed (Steps 1-4 done)';
