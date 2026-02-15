-- ============================================================
-- Add presence & custom status fields to tradesCompanyMember and Client
-- Run: psql "$DATABASE_URL" -f ./db/migrations/20260210_add_presence_status.sql
-- ============================================================

-- Pro members: lastSeenAt + custom status
ALTER TABLE app."tradesCompanyMember"
  ADD COLUMN IF NOT EXISTS "lastSeenAt"   TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS "customStatus" TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "statusEmoji"  TEXT DEFAULT NULL;

-- Client: customStatus + statusEmoji (lastActiveAt already exists)
ALTER TABLE app."Client"
  ADD COLUMN IF NOT EXISTS "customStatus" TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "statusEmoji"  TEXT DEFAULT NULL;

-- Index for fast presence lookups
CREATE INDEX IF NOT EXISTS idx_trades_member_last_seen ON app."tradesCompanyMember" ("lastSeenAt");
CREATE INDEX IF NOT EXISTS idx_client_last_active ON app."Client" ("lastActiveAt");
