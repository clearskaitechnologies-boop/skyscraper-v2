-- Fix users.orgId column type from TEXT to UUID
-- This resolves: PostgresError { code: "42883", message: "operator does not exist: uuid = text" }
-- Date: 2025-12-05

BEGIN;

-- Step 1: Clean up any invalid orgId values that can't be cast to UUID
UPDATE public."users"
SET "orgId" = NULL
WHERE "orgId" IS NOT NULL
  AND "orgId" !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 2: Change column type from TEXT to UUID
ALTER TABLE public."users"
  ALTER COLUMN "orgId" TYPE uuid USING "orgId"::uuid;

-- Step 3: Verify the change
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'orgId' 
      AND data_type = 'uuid'
  ) THEN
    RAISE NOTICE '✅ users.orgId successfully converted to UUID';
  ELSE
    RAISE EXCEPTION '❌ users.orgId type conversion failed';
  END IF;
END $$;

COMMIT;

-- How to run this migration:
-- psql "$DATABASE_URL" -f db/migrations/20251205_fix_users_orgid_type.sql
