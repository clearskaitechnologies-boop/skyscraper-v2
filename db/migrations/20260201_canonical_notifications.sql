-- =============================================================================
-- CANONICAL NOTIFICATIONS SCHEMA
-- Migration: 20260201_canonical_notifications.sql
--
-- Ensures the `notifications` table matches what the app code expects:
--   INSERT: (id, org_id, clerk_user_id, level, title, body, link, created_at)
--   SELECT: n.id, n.level, n.title, n.body, n.link, n.created_at
--           WHERE n.clerk_user_id = $2 OR (n.org_id = $1 AND n.clerk_user_id IS NULL)
--
-- This migration is idempotent — it adds missing columns without losing data.
-- =============================================================================

-- Step 1: Ensure the table exists with the canonical shape
CREATE TABLE IF NOT EXISTS notifications (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id          TEXT,
  clerk_user_id   TEXT,
  level           TEXT DEFAULT 'info',
  title           TEXT NOT NULL,
  body            TEXT,
  link            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: If an older migration created the table with user_id instead of clerk_user_id, add alias
DO $$
BEGIN
  -- Add clerk_user_id if missing (older schema used user_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'clerk_user_id'
  ) THEN
    -- Check if user_id exists and rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'notifications' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE notifications RENAME COLUMN user_id TO clerk_user_id;
    ELSE
      ALTER TABLE notifications ADD COLUMN clerk_user_id TEXT;
    END IF;
  END IF;

  -- Add org_id if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'org_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN org_id TEXT;
  END IF;

  -- Add level if missing (older schema used type)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'level'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'notifications' AND column_name = 'type'
    ) THEN
      ALTER TABLE notifications RENAME COLUMN type TO level;
    ELSE
      ALTER TABLE notifications ADD COLUMN level TEXT DEFAULT 'info';
    END IF;
  END IF;

  -- Add body if missing (older schema used message)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'body'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'notifications' AND column_name = 'message'
    ) THEN
      ALTER TABLE notifications RENAME COLUMN message TO body;
    ELSE
      ALTER TABLE notifications ADD COLUMN body TEXT;
    END IF;
  END IF;

  -- Add link if missing (older schema used action_url)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'link'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'notifications' AND column_name = 'action_url'
    ) THEN
      ALTER TABLE notifications RENAME COLUMN action_url TO link;
    ELSE
      ALTER TABLE notifications ADD COLUMN link TEXT;
    END IF;
  END IF;

  -- Make org_id nullable (older schema had NOT NULL)
  ALTER TABLE notifications ALTER COLUMN org_id DROP NOT NULL;

  -- Make clerk_user_id nullable
  ALTER TABLE notifications ALTER COLUMN clerk_user_id DROP NOT NULL;

END $$;

-- Step 3: Ensure notifications_reads exists
CREATE TABLE IF NOT EXISTS notifications_reads (
  notification_id TEXT NOT NULL,
  clerk_user_id   TEXT NOT NULL,
  read_at         TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (notification_id, clerk_user_id)
);

-- Step 4: Indexes
CREATE INDEX IF NOT EXISTS idx_notif_clerk_user ON notifications(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_notif_org_id ON notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_notif_created_at ON notifications(created_at DESC);

-- Verify
SELECT
  column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
