-- Vendors & Manufacturers Table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vendor', 'manufacturer')),
  service_types TEXT[],
  region TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contractors Network Table
CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  trade TEXT NOT NULL,
  region TEXT NOT NULL,
  company_name TEXT,
  website TEXT,
  contact_email TEXT,
  profile_photo_url TEXT,
  description TEXT,
  premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(type);
CREATE INDEX IF NOT EXISTS idx_vendors_region ON vendors(region);
CREATE INDEX IF NOT EXISTS idx_contractors_trade ON contractors(trade);
CREATE INDEX IF NOT EXISTS idx_contractors_region ON contractors(region);
CREATE INDEX IF NOT EXISTS idx_contractors_premium ON contractors(premium);

-- RLS Policies
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;

-- Public read access for vendors
CREATE POLICY "Public read access for vendors"
  ON vendors FOR SELECT
  USING (true);

-- Org owners can manage their vendors
CREATE POLICY "Org owners can manage vendors"
  ON vendors FOR ALL
  USING (org_id IN (
    SELECT org_id FROM users WHERE clerk_user_id = auth.uid()
  ));

-- Public read access for contractors
CREATE POLICY "Public read access for contractors"
  ON contractors FOR SELECT
  USING (true);

-- Users can manage their own contractor profile
CREATE POLICY "Users can manage own contractor profile"
  ON contractors FOR ALL
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.uid()
  ));
