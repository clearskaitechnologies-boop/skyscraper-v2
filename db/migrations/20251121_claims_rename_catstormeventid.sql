-- Fix duplicate storm event columns: ensure single proper camelCase column for Prisma
-- If legacy lowercase catstormeventid exists and quoted "catStormEventId" also exists, drop lowercase.
-- If only lowercase exists, rename it. If neither exists, create quoted column.

DO $$
DECLARE
  has_lower BOOLEAN := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='claims' AND column_name='catstormeventid');
  has_camel BOOLEAN := EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='claims' AND column_name='catStormEventId');
BEGIN
  IF has_lower AND has_camel THEN
    -- Two versions present: drop the lowercase one to avoid confusion.
    EXECUTE 'ALTER TABLE claims DROP COLUMN catstormeventid';
    RAISE NOTICE 'Dropped lowercase catstormeventid (camelCase already present).';
  ELSIF has_lower AND NOT has_camel THEN
    -- Rename lowercase to proper camelCase (quoted preserves case)
    EXECUTE 'ALTER TABLE claims RENAME COLUMN catstormeventid TO "catStormEventId"';
    RAISE NOTICE 'Renamed lowercase catstormeventid to camelCase catStormEventId.';
  ELSIF NOT has_lower AND NOT has_camel THEN
    -- Create fresh column
    EXECUTE 'ALTER TABLE claims ADD COLUMN "catStormEventId" TEXT';
    RAISE NOTICE 'Added missing camelCase catStormEventId column.';
  ELSE
    RAISE NOTICE 'CamelCase catStormEventId already correct; no action needed.';
  END IF;
END $$;

DO $$ BEGIN RAISE NOTICE '✅ catStormEventId column normalization complete'; END $$;
