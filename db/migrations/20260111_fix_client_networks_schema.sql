-- Fix client_networks schema to match Prisma model
-- This migration recreates the tables with the correct column names and types

-- Drop old tables if they exist (they have wrong column names)
DROP TABLE IF EXISTS app.client_saved_trades CASCADE;
DROP TABLE IF EXISTS app.client_contacts CASCADE;
DROP TABLE IF EXISTS app.client_networks CASCADE;

-- Also check public schema
DROP TABLE IF EXISTS public.client_saved_trades CASCADE;
DROP TABLE IF EXISTS public.client_contacts CASCADE;
DROP TABLE IF EXISTS public.client_networks CASCADE;

-- Create client_networks with correct schema matching Prisma model
CREATE TABLE IF NOT EXISTS app.client_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" TEXT NOT NULL,  -- TEXT to match Org.id (cuid format, not UUID)
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  "propertyType" TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  category TEXT DEFAULT 'Homeowner', -- Added: Homeowner, Business Owner, Broker, Realtor, Property Manager, Landlord
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_networks_org ON app.client_networks("orgId");
CREATE INDEX IF NOT EXISTS idx_client_networks_status ON app.client_networks(status);
CREATE INDEX IF NOT EXISTS idx_client_networks_category ON app.client_networks(category);

-- Create client_contacts table
CREATE TABLE IF NOT EXISTS app.client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientNetworkId" UUID NOT NULL REFERENCES app.client_networks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'Homeowner',
  "isPrimary" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_contacts_network ON app.client_contacts("clientNetworkId");

-- Create client_saved_trades table
CREATE TABLE IF NOT EXISTS app.client_saved_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientNetworkId" UUID NOT NULL REFERENCES app.client_networks(id) ON DELETE CASCADE,
  "companyId" UUID NOT NULL,
  notes TEXT,
  rating INTEGER,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("clientNetworkId", "companyId")
);

CREATE INDEX IF NOT EXISTS idx_client_saved_trades_network ON app.client_saved_trades("clientNetworkId");
CREATE INDEX IF NOT EXISTS idx_client_saved_trades_company ON app.client_saved_trades("companyId");

-- Grant permissions
GRANT ALL ON app.client_networks TO postgres, service_role;
GRANT ALL ON app.client_contacts TO postgres, service_role;
GRANT ALL ON app.client_saved_trades TO postgres, service_role;

RAISE NOTICE '✅ client_networks schema fixed and aligned with Prisma model';
