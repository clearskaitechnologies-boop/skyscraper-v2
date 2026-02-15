-- Add trial reminder email tracking flags
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "sentTrialT24" BOOLEAN DEFAULT false;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "sentTrialT1" BOOLEAN DEFAULT false;
