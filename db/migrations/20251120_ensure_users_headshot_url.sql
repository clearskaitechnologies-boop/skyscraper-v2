-- Migration: Ensure users.headshot_url column exists
-- Purpose: Idempotently guarantee the headshot_url column required by Prisma mapping (users.headshotUrl @map("headshot_url"))
-- Safe to run multiple times.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS headshot_url TEXT;

DO $$
BEGIN
  BEGIN
    COMMENT ON COLUMN users.headshot_url IS 'Profile picture URL for internal Teams and external Trades Network display';
  EXCEPTION WHEN others THEN
    -- ignore if comment already exists or column missing
  END;
END;$$;
