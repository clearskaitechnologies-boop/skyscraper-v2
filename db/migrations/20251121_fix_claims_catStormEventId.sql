DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='claims' AND column_name='catStormEventId'
  ) THEN
    ALTER TABLE claims ADD COLUMN "catStormEventId" TEXT;
    RAISE NOTICE '✅ Added missing camelCase column catStormEventId to claims';
  ELSE
    RAISE NOTICE '✅ catStormEventId already present';
  END IF;
END $$;