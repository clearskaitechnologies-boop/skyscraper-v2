-- Ensure pgcrypto exists for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create token_orders if it does not exist, with correct types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='token_orders'
  ) THEN
    CREATE TABLE public.token_orders (
      id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id       uuid,
      pack_id      uuid NOT NULL,
      qty          integer NOT NULL DEFAULT 1,
      price_cents  integer NOT NULL,
      status       text NOT NULL DEFAULT 'pending',
      created_at   timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Ensure pack_id is uuid (in case table existed with text)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='token_orders'
      AND column_name='pack_id' AND data_type='text'
  ) THEN
    ALTER TABLE public.token_orders
      ALTER COLUMN pack_id TYPE uuid USING pack_id::uuid;
  END IF;
END $$;

-- Add the FK if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema='public'
      AND table_name='token_orders'
      AND constraint_type='FOREIGN KEY'
      AND constraint_name='token_orders_pack_id_fkey'
  ) THEN
    ALTER TABLE public.token_orders
      ADD CONSTRAINT token_orders_pack_id_fkey
      FOREIGN KEY (pack_id) REFERENCES public.token_packs(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_token_orders_pack ON public.token_orders(pack_id);
