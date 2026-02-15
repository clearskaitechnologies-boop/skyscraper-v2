-- Ensure visible_to_client column exists and index for portal filtering
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='claim_timeline_events' AND column_name='visible_to_client'
  ) THEN
    ALTER TABLE app.claim_timeline_events ADD COLUMN visible_to_client boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='claim_timeline_events_claim_id_visible_to_client_idx') THEN
    CREATE INDEX claim_timeline_events_claim_id_visible_to_client_idx ON app.claim_timeline_events(claim_id, visible_to_client);
  END IF;
END $$;
