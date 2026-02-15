-- Idempotent creation of claim_timeline_events table matching Prisma model
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name='claim_timeline_events'
  ) THEN
    CREATE TABLE app.claim_timeline_events (
      id text PRIMARY KEY,
      org_id text NULL,
      claim_id text NOT NULL,
      type text NOT NULL,
      description text NULL,
      actor_id text NULL,
      actor_type text NULL,
      related_ids jsonb NULL,
      metadata jsonb NULL,
      visible_to_client boolean NOT NULL DEFAULT false,
      occurred_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- Foreign key constraints (added only if table newly created or missing constraints)
DO $$ BEGIN
  -- claims relation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name='claim_timeline_events' AND constraint_name='claim_timeline_events_claim_id_fkey'
  ) THEN
    ALTER TABLE app.claim_timeline_events
      ADD CONSTRAINT claim_timeline_events_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  -- users relation (actor_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name='claim_timeline_events' AND constraint_name='claim_timeline_events_actor_id_fkey'
  ) THEN
    ALTER TABLE app.claim_timeline_events
      ADD CONSTRAINT claim_timeline_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Indexes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='claim_timeline_events_actor_id_idx') THEN
    CREATE INDEX claim_timeline_events_actor_id_idx ON app.claim_timeline_events(actor_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='claim_timeline_events_claim_id_idx') THEN
    CREATE INDEX claim_timeline_events_claim_id_idx ON app.claim_timeline_events(claim_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='claim_timeline_events_occurred_at_idx') THEN
    CREATE INDEX claim_timeline_events_occurred_at_idx ON app.claim_timeline_events(occurred_at);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='claim_timeline_events_type_idx') THEN
    CREATE INDEX claim_timeline_events_type_idx ON app.claim_timeline_events(type);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='claim_timeline_events_claim_id_visible_to_client_idx') THEN
    CREATE INDEX claim_timeline_events_claim_id_visible_to_client_idx ON app.claim_timeline_events(claim_id, visible_to_client);
  END IF;
END $$;
