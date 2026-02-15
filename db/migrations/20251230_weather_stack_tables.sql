-- Weather Stack Tables Migration
-- Creates tables for weather events, Quick DOL, daily snapshots, documents, and usage tokens

-- Weather Events table
CREATE TABLE IF NOT EXISTS app.weather_events (
  id TEXT PRIMARY KEY,
  "propertyId" TEXT NOT NULL,
  source TEXT NOT NULL,
  type TEXT NOT NULL,
  "timeUtc" TIMESTAMP(3) NOT NULL,
  magnitude DOUBLE PRECISION,
  "distanceMiles" DOUBLE PRECISION,
  "geometryJson" TEXT NOT NULL,
  "metadataJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS weather_events_propertyId_timeUtc_idx ON app.weather_events("propertyId", "timeUtc");
CREATE INDEX IF NOT EXISTS weather_events_source_type_idx ON app.weather_events(source, type);

-- Quick DOL table
CREATE TABLE IF NOT EXISTS app.quick_dols (
  "propertyId" TEXT PRIMARY KEY,
  "recommendedDate" TEXT,
  confidence DOUBLE PRECISION,
  reason TEXT,
  "eventCount" INTEGER NOT NULL DEFAULT 0,
  "topHailInches" DOUBLE PRECISION,
  "topDistanceMiles" DOUBLE PRECISION,
  "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS quick_dols_lastUpdated_idx ON app.quick_dols("lastUpdated");

-- Weather Daily Snapshots table
CREATE TABLE IF NOT EXISTS app.weather_daily_snapshots (
  id TEXT PRIMARY KEY,
  "propertyId" TEXT NOT NULL,
  "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "scoredJson" JSONB NOT NULL,
  "dolJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS weather_daily_snapshots_propertyId_snapshotDate_idx ON app.weather_daily_snapshots("propertyId", "snapshotDate");

-- Weather Documents table
CREATE TABLE IF NOT EXISTS app.weather_documents (
  id TEXT PRIMARY KEY,
  "propertyId" TEXT NOT NULL,
  "orgId" TEXT NOT NULL,
  kind TEXT NOT NULL,
  "pdfUrl" TEXT NOT NULL,
  "summaryText" TEXT,
  "aiModelUsed" TEXT,
  "eventCount" INTEGER NOT NULL DEFAULT 0,
  "dolDate" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS weather_documents_propertyId_idx ON app.weather_documents("propertyId");
CREATE INDEX IF NOT EXISTS weather_documents_orgId_idx ON app.weather_documents("orgId");
CREATE INDEX IF NOT EXISTS weather_documents_kind_idx ON app.weather_documents(kind);

-- Usage Tokens table (billing)
CREATE TABLE IF NOT EXISTS app.usage_tokens (
  id TEXT PRIMARY KEY,
  "orgId" TEXT NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'beta',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS usage_tokens_orgId_key ON app.usage_tokens("orgId");
CREATE INDEX IF NOT EXISTS usage_tokens_orgId_idx ON app.usage_tokens("orgId");

-- Trigger to update updatedAt on usage_tokens
CREATE OR REPLACE FUNCTION app.update_usage_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS usage_tokens_updated_at_trigger ON app.usage_tokens;
CREATE TRIGGER usage_tokens_updated_at_trigger
  BEFORE UPDATE ON app.usage_tokens
  FOR EACH ROW
  EXECUTE FUNCTION app.update_usage_tokens_updated_at();

-- Trigger to update updatedAt on quick_dols
CREATE OR REPLACE FUNCTION app.update_quick_dols_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."lastUpdated" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quick_dols_updated_at_trigger ON app.quick_dols;
CREATE TRIGGER quick_dols_updated_at_trigger
  BEFORE UPDATE ON app.quick_dols
  FOR EACH ROW
  EXECUTE FUNCTION app.update_quick_dols_updated_at();
