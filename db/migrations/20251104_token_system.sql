-- Token usage system migration
-- Run: psql "$DATABASE_URL" -f ./db/migrations/20251104_token_system.sql

-- Usage tokens per user (monthly-reset)
CREATE TABLE IF NOT EXISTS usage_tokens (
  user_id UUID PRIMARY KEY,
  mockup_remaining INT NOT NULL DEFAULT 0,
  dol_remaining INT NOT NULL DEFAULT 0,
  weather_remaining INT NOT NULL DEFAULT 0,
  last_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Simple helper to "touch" updated_at
CREATE OR REPLACE FUNCTION touch_usage_tokens()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_usage_tokens ON usage_tokens;
CREATE TRIGGER trg_touch_usage_tokens
BEFORE UPDATE ON usage_tokens
FOR EACH ROW EXECUTE PROCEDURE touch_usage_tokens();

-- Damage reports log (PDF + JSON)
CREATE TABLE IF NOT EXISTS damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  address TEXT NOT NULL,
  date_of_loss DATE NOT NULL,
  roof_type TEXT NOT NULL,
  roof_sqft INT,
  json_payload JSONB NOT NULL,
  pdf_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional weather_documents if missing (lightweight)
CREATE TABLE IF NOT EXISTS weather_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  address TEXT NOT NULL,
  date_of_loss DATE NOT NULL,
  payload JSONB,
  pdf_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add stripe_customer_id to users table if not exists
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_damage_reports_user_id ON damage_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_damage_reports_created_at ON damage_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_documents_user_id ON weather_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
