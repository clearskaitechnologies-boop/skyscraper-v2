-- Usage Meters Table
-- Tracks API usage and enforces quotas

CREATE TABLE IF NOT EXISTS usage_meters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  
  -- Resource tracking
  resource_type TEXT NOT NULL, -- 'api_calls', 'ai_requests', 'pdf_generation', etc
  count INTEGER NOT NULL DEFAULT 0,
  
  -- Time window
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Limits
  quota_limit INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_usage_meters_org_id (org_id),
  INDEX idx_usage_meters_user_id (user_id),
  INDEX idx_usage_meters_period (period_start, period_end),
  UNIQUE INDEX idx_usage_meters_unique (org_id, resource_type, period_start)
);

-- Update trigger
CREATE OR REPLACE FUNCTION update_usage_meters_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usage_meters_updated_at
BEFORE UPDATE ON usage_meters
FOR EACH ROW
EXECUTE FUNCTION update_usage_meters_timestamp();
