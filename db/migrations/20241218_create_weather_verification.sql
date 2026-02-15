-- ============================================================================
-- WEATHER VERIFICATION - CACHED WEATHER FACTS
-- Fetch weather from Open-Meteo, normalize, cache per claim
-- No AI weather hallucinations - only verified data
-- ============================================================================

CREATE TABLE IF NOT EXISTS claim_weather_reports (
  id VARCHAR(30) PRIMARY KEY,
  org_id VARCHAR(255) NOT NULL,
  claim_id VARCHAR(255) NOT NULL,
  
  -- Provider info
  provider VARCHAR(50) NOT NULL, -- "open-meteo" | "visual-crossing" | "noaa"
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  
  -- Event window
  event_start TIMESTAMPTZ NOT NULL,
  event_end TIMESTAMPTZ NOT NULL,
  
  -- Normalized weather metrics (facts only)
  max_wind_gust_mph DOUBLE PRECISION,
  max_sustained_wind_mph DOUBLE PRECISION,
  max_hail_inches DOUBLE PRECISION,
  precipitation_in DOUBLE PRECISION,
  snowfall_in DOUBLE PRECISION,
  
  -- Provenance & citation
  source_label TEXT NOT NULL, -- Human-readable citation: "Open-Meteo Weather API (Dec 18, 2024)"
  raw JSONB NOT NULL, -- Full provider response for audit trail
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One report per claim+provider+window (prevents duplicate fetches)
  UNIQUE(claim_id, provider, event_start, event_end)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_claim_weather_reports_org_claim ON claim_weather_reports(org_id, claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_weather_reports_fetched_at ON claim_weather_reports(fetched_at DESC);

-- Weather verification rules:
-- 1. Always cache with provider + timestamp for auditability
-- 2. Rate limit refresh to prevent API abuse (1 per 10 min per claim)
-- 3. Pass weather facts into AI prompts (no hallucination)
-- 4. Include source citation in PDFs

COMMENT ON TABLE claim_weather_reports IS 'Cached weather verification data from external providers (Open-Meteo, NOAA, etc.)';
COMMENT ON COLUMN claim_weather_reports.provider IS 'Weather data provider: open-meteo (primary), visual-crossing, noaa';
COMMENT ON COLUMN claim_weather_reports.source_label IS 'Human-readable citation for PDF footer: "Open-Meteo Weather API (fetched Dec 18, 2024)"';
COMMENT ON COLUMN claim_weather_reports.raw IS 'Full API response for audit trail and debugging';
