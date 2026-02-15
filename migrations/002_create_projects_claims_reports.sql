-- 002_create_projects_claims_reports.sql
-- Create projects, claims, weather_events, carriers, carrier_profiles, scopes, photos, reports
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  client_id uuid,
  address jsonb,
  latitude double precision,
  longitude double precision,
  roof jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects (org_id);

-- Carriers and carrier profiles
CREATE TABLE IF NOT EXISTS carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  profile jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_carriers_name ON carriers (lower(name));

-- Claims
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  carrier_id uuid,
  policy_type text,
  acv_or_rcv text,
  deductible integer,
  claim_no text,
  dol date,
  inspector text,
  adjuster text,
  claim_status text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claims_project_id ON claims (project_id);

-- Weather events
CREATE TABLE IF NOT EXISTS weather_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  source text,
  event_type text,
  event_date timestamptz,
  hail_size_in double precision,
  wind_speed_mph double precision,
  confidence double precision,
  distance double precision,
  map_url text,
  raw jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weather_project_id ON weather_events (project_id);

-- Scope / line-items
CREATE TABLE IF NOT EXISTS scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  system text,
  items jsonb,
  waste_pct numeric,
  created_at timestamptz DEFAULT now()
);

-- Photos
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  label text,
  tags text[],
  url text,
  exif jsonb,
  ai_tags text[],
  created_at timestamptz DEFAULT now()
);

-- Reports: store render context JSON + checksum for audit
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  org_id uuid NOT NULL,
  type text NOT NULL,
  version integer DEFAULT 1,
  status text DEFAULT 'queued',
  pdf_url text,
  thumbnail_url text,
  version_context jsonb,
  version_context_hash text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports (project_id);

-- Trigger to update updated_at on update for projects, claims, reports
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER trg_projects_update BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_claims_update BEFORE UPDATE ON claims
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_reports_update BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
