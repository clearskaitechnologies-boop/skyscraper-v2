-- Add missing claim clientId column if not present (idempotent DO block)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='claims' AND column_name='clientId'
  ) THEN
    ALTER TABLE "claims" ADD COLUMN "clientId" text;
  END IF;
END $$;

-- Ensure timeline visibility column exists (idempotent DO block)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='claim_timeline_events' AND column_name='visible_to_client'
  ) THEN
    ALTER TABLE "claim_timeline_events" ADD COLUMN visible_to_client boolean DEFAULT false;
  END IF;
END $$;

-- Index for portal filtering if not present
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='idx_claims_clientId') THEN
    CREATE INDEX idx_claims_clientId ON "claims"("clientId");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='idx_claim_timeline_events_visible') THEN
    CREATE INDEX idx_claim_timeline_events_visible ON "claim_timeline_events"(claim_id, visible_to_client);
  END IF;
END $$;
