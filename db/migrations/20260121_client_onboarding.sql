-- Client Onboarding Schema Updates
-- Date: 2026-01-21
-- Description: Add clients table and update user_registry for client onboarding

-- Add new columns to user_registry
ALTER TABLE user_registry
ADD COLUMN IF NOT EXISTS "primaryEmail" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "onboardingComplete" BOOLEAN DEFAULT false;

-- Create clients table for client profiles
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  "firstName" VARCHAR(100),
  "lastName" VARCHAR(100),
  phone VARCHAR(20),
  "clientType" VARCHAR(50), -- homeowner, business_owner, landlord, property_manager, broker, real_estate_agent
  "projectNeeds" TEXT[] DEFAULT '{}',
  "projectDescription" TEXT,
  "idealContractor" TEXT,
  "photoUrls" TEXT[] DEFAULT '{}',
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  status VARCHAR(20) DEFAULT 'active',
  "avatarUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_client_type ON clients("clientType");
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Update trigger for updatedAt
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_clients_updated_at ON clients;
CREATE TRIGGER trigger_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

-- Done
SELECT 'Client onboarding migration complete' AS status;
