-- Ensure extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---- Fix organizations table to have org_id PK (without breaking existing data)
ALTER TABLE IF EXISTS organizations
  ADD COLUMN IF NOT EXISTS org_id uuid;

-- Populate org_id for any existing rows
UPDATE organizations
SET org_id = COALESCE(org_id, gen_random_uuid())
WHERE org_id IS NULL;

-- Add PK on org_id if none exists yet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.organizations'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE organizations ADD PRIMARY KEY (org_id);
  END IF;
END $$;

-- Add branding columns if they aren't there yet
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS primary_color text,
  ADD COLUMN IF NOT EXISTS secondary_color text;

-- Optional seed: only insert if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM organizations) THEN
    INSERT INTO organizations (org_id, name)
    VALUES (gen_random_uuid(), 'Default Org');
  END IF;
END $$;

-- ---- Align token_orders.pack_id type to token_packs.id (uuid)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema='public'
       AND table_name='token_orders'
       AND column_name='pack_id'
       AND data_type='text'
  ) THEN
    -- Convert text -> uuid (safe if table empty; will fail only if bad data)
    ALTER TABLE token_orders
      ALTER COLUMN pack_id TYPE uuid USING pack_id::uuid;
  END IF;
END $$;

-- Recreate FK if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema='public'
      AND tc.table_name='token_orders'
      AND tc.constraint_type='FOREIGN KEY'
      AND tc.constraint_name='token_orders_pack_id_fkey'
  ) THEN
    ALTER TABLE token_orders
      ADD CONSTRAINT token_orders_pack_id_fkey
      FOREIGN KEY (pack_id) REFERENCES token_packs(id) ON DELETE RESTRICT;
  END IF;
END $$;
