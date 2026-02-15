-- Phase 2.1 (3.0) Schema Updates
-- Add OrgMember, ApiKey models and extend OrgBranding for white label

-- OrgMember table for team management
CREATE TABLE IF NOT EXISTS "org_members" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "org_id" TEXT NOT NULL REFERENCES "Org"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
  "invited_by" TEXT,
  "invited_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "joined_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "org_members_org_id_idx" ON "org_members"("org_id");
CREATE INDEX IF NOT EXISTS "org_members_user_id_idx" ON "org_members"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "org_members_org_user_unique" ON "org_members"("org_id", "user_id");

-- ApiKey table for developer access
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "org_id" TEXT NOT NULL REFERENCES "Org"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "key_prefix" TEXT NOT NULL, -- First 8 chars for display (e.g., "sk_live_")
  "hashed_key" TEXT NOT NULL, -- bcrypt/argon2 hash of full key
  "created_by" TEXT NOT NULL, -- Clerk user ID
  "last_used_at" TIMESTAMP WITH TIME ZONE,
  "expires_at" TIMESTAMP WITH TIME ZONE,
  "revoked_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "api_keys_org_id_idx" ON "api_keys"("org_id");
CREATE INDEX IF NOT EXISTS "api_keys_key_prefix_idx" ON "api_keys"("key_prefix");
CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_hashed_key_unique" ON "api_keys"("hashed_key");

-- Add white label fields to org_branding
ALTER TABLE "org_branding" 
  ADD COLUMN IF NOT EXISTS "subdomain" TEXT,
  ADD COLUMN IF NOT EXISTS "color_secondary" TEXT DEFAULT '#6B7280',
  ADD COLUMN IF NOT EXISTS "font_family" TEXT DEFAULT 'Inter',
  ADD COLUMN IF NOT EXISTS "custom_css" TEXT,
  ADD COLUMN IF NOT EXISTS "favicon_url" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "org_branding_subdomain_unique" ON "org_branding"("subdomain") WHERE "subdomain" IS NOT NULL;

-- TokensLedger already exists as tokens_ledger, ensure it has all fields
-- (Schema already has TokenLedger model mapped to tokens_ledger)

-- Add assistant_mode to User table for Skai Assistant preferences
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "assistant_mode" TEXT DEFAULT 'smart_reactive', -- passive, smart_reactive, fully_embedded, field_mode
  ADD COLUMN IF NOT EXISTS "assistant_enabled" BOOLEAN DEFAULT true;

-- Add trial tracking to Subscription
ALTER TABLE "Subscription"
  ADD COLUMN IF NOT EXISTS "trial_start" TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS "trial_end" TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS "trial_tokens_granted" INTEGER DEFAULT 0;

-- Add quota tracking columns to Org
ALTER TABLE "Org"
  ADD COLUMN IF NOT EXISTS "seats_limit" INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "seats_used" INTEGER DEFAULT 1;

-- Vendor Connect tables
CREATE TABLE IF NOT EXISTS "vendors" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "company_name" TEXT NOT NULL,
  "contact_email" TEXT NOT NULL,
  "contact_phone" TEXT,
  "service_categories" TEXT[], -- array of service types
  "api_endpoint" TEXT,
  "api_key_encrypted" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, suspended
  "approved_by" TEXT,
  "approved_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "vendors_status_idx" ON "vendors"("status");
CREATE INDEX IF NOT EXISTS "vendors_company_name_idx" ON "vendors"("company_name");

-- Export history tracking
CREATE TABLE IF NOT EXISTS "exports" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "org_id" TEXT NOT NULL REFERENCES "Org"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL,
  "job_id" TEXT,
  "export_type" TEXT NOT NULL, -- packet_zip, carrier_pdf, custom
  "file_url" TEXT,
  "file_size" INTEGER,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "exports_org_id_idx" ON "exports"("org_id");
CREATE INDEX IF NOT EXISTS "exports_user_id_idx" ON "exports"("user_id");
CREATE INDEX IF NOT EXISTS "exports_created_at_idx" ON "exports"("created_at" DESC);

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_org_members_updated_at BEFORE UPDATE ON org_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE org_members IS 'Team members and roles within an organization';
COMMENT ON TABLE api_keys IS 'API keys for programmatic access to SkaiScraper';
COMMENT ON TABLE vendors IS 'External vendors for Vendor Connect integration';
COMMENT ON TABLE exports IS 'History of generated export packets and carrier reports';
