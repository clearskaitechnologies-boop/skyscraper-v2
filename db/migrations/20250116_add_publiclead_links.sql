-- Migration: Add PublicLead links to Customer + Property
-- Phase 5: Public Intake → CRM + AI Wiring

ALTER TABLE public_leads 
ADD COLUMN IF NOT EXISTS "customerId" TEXT,
ADD COLUMN IF NOT EXISTS "propertyId" TEXT;

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_public_leads_customer ON public_leads("customerId");
CREATE INDEX IF NOT EXISTS idx_public_leads_property ON public_leads("propertyId");
