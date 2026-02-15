-- Create client_networks and client_contacts tables in app schema

-- Client Networks table
CREATE TABLE IF NOT EXISTS app.client_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
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
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_networks_org ON app.client_networks("orgId");
CREATE INDEX IF NOT EXISTS idx_client_networks_status ON app.client_networks(status);

-- Client Contacts table
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

-- Client Saved Trades table
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
