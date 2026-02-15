-- Phase 4: Trial & Billing System Migration
-- Add trial tracking and billing settings to Org model
-- Add BillingSettings table for auto-refill configuration

-- Add trial and billing fields to Org table
ALTER TABLE "Org" 
ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT,
ADD COLUMN IF NOT EXISTS "trialStartAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "trialStatus" TEXT,
ADD COLUMN IF NOT EXISTS "planKey" TEXT;

-- Create BillingSettings table
CREATE TABLE IF NOT EXISTS "BillingSettings" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "autoRefill" BOOLEAN NOT NULL DEFAULT false,
    "refillThreshold" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSettings_pkey" PRIMARY KEY ("id")
);

-- Create unique index on orgId
CREATE UNIQUE INDEX IF NOT EXISTS "BillingSettings_orgId_key" ON "BillingSettings"("orgId");

-- Add foreign key constraint
ALTER TABLE "BillingSettings" 
ADD CONSTRAINT "BillingSettings_orgId_fkey" 
FOREIGN KEY ("orgId") REFERENCES "Org"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "Org_trialEndsAt_idx" ON "Org"("trialEndsAt");
CREATE INDEX IF NOT EXISTS "Org_subscriptionStatus_idx" ON "Org"("subscriptionStatus");
CREATE INDEX IF NOT EXISTS "Org_stripeCustomerId_idx" ON "Org"("stripeCustomerId");
