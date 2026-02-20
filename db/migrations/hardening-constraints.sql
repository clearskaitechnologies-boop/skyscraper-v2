-- ============================================================================
-- 🛡️ DATABASE CONSTRAINT HARDENING MIGRATION
-- ============================================================================
-- This migration adds constraints to PREVENT future data corruption.
-- Run AFTER the integrity audit passes with 0 violations.
--
-- Usage: psql $DATABASE_URL -f db/migrations/hardening-constraints.sql
-- ============================================================================

\echo '============================================================================'
\echo '🛡️ DATABASE CONSTRAINT HARDENING — Starting...'
\echo '============================================================================'
\echo ''

-- ============================================================================
-- 1. TRADES CONNECTION CONSTRAINTS
-- ============================================================================

\echo '🔗 Adding tradesConnection constraints...'

-- 1.1 Prevent self-connections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'no_self_connection'
  ) THEN
    ALTER TABLE "tradesConnection"
    ADD CONSTRAINT no_self_connection
    CHECK ("requesterId" != "addresseeId");
    RAISE NOTICE '✅ Added: no_self_connection constraint';
  ELSE
    RAISE NOTICE '⏭️ Skipped: no_self_connection (already exists)';
  END IF;
END $$;

-- 1.2 Unique pair constraint for accepted connections
-- This prevents duplicate connections between same two users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'unique_accepted_connection_pair'
  ) THEN
    CREATE UNIQUE INDEX unique_accepted_connection_pair
    ON "tradesConnection" (
      LEAST("requesterId", "addresseeId"),
      GREATEST("requesterId", "addresseeId")
    )
    WHERE status = 'accepted';
    RAISE NOTICE '✅ Added: unique_accepted_connection_pair index';
  ELSE
    RAISE NOTICE '⏭️ Skipped: unique_accepted_connection_pair (already exists)';
  END IF;
END $$;

-- 1.3 Ensure requesterId and addresseeId are not null
DO $$
BEGIN
  -- Check if columns are already NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tradesConnection' 
      AND column_name = 'requesterId'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "tradesConnection" ALTER COLUMN "requesterId" SET NOT NULL;
    RAISE NOTICE '✅ Added: requesterId NOT NULL';
  ELSE
    RAISE NOTICE '⏭️ Skipped: requesterId already NOT NULL';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tradesConnection' 
      AND column_name = 'addresseeId'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "tradesConnection" ALTER COLUMN "addresseeId" SET NOT NULL;
    RAISE NOTICE '✅ Added: addresseeId NOT NULL';
  ELSE
    RAISE NOTICE '⏭️ Skipped: addresseeId already NOT NULL';
  END IF;
END $$;


-- ============================================================================
-- 2. MEMBER COMPANY FOREIGN KEY
-- ============================================================================

\echo ''
\echo '🏢 Adding tradesCompanyMember constraints...'

-- Note: FK already exists in schema, but add index for performance if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_member_company_fk'
  ) THEN
    CREATE INDEX idx_member_company_fk ON "tradesCompanyMember" ("companyId")
    WHERE "companyId" IS NOT NULL;
    RAISE NOTICE '✅ Added: idx_member_company_fk index';
  ELSE
    RAISE NOTICE '⏭️ Skipped: idx_member_company_fk (already exists)';
  END IF;
END $$;


-- ============================================================================
-- 3. CLAIM ACCESS CONSTRAINTS
-- ============================================================================

\echo ''
\echo '📋 Adding client_access constraints...'

-- Ensure claimId is NOT NULL (should already be, but enforce)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_access' 
      AND column_name = 'claimId'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "client_access" ALTER COLUMN "claimId" SET NOT NULL;
    RAISE NOTICE '✅ Added: claimId NOT NULL';
  ELSE
    RAISE NOTICE '⏭️ Skipped: claimId already NOT NULL';
  END IF;
END $$;

-- Ensure email is NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_access' 
      AND column_name = 'email'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "client_access" ALTER COLUMN "email" SET NOT NULL;
    RAISE NOTICE '✅ Added: email NOT NULL';
  ELSE
    RAISE NOTICE '⏭️ Skipped: email already NOT NULL';
  END IF;
END $$;


-- ============================================================================
-- 4. MESSAGE INTEGRITY CONSTRAINTS
-- ============================================================================

\echo ''
\echo '💬 Adding Message/MessageThread constraints...'

-- Ensure threadId is NOT NULL on Message
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Message' 
      AND column_name = 'threadId'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "Message" ALTER COLUMN "threadId" SET NOT NULL;
    RAISE NOTICE '✅ Added: threadId NOT NULL on Message';
  ELSE
    RAISE NOTICE '⏭️ Skipped: threadId already NOT NULL';
  END IF;
END $$;

-- Ensure senderUserId is NOT NULL on Message
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Message' 
      AND column_name = 'senderUserId'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "Message" ALTER COLUMN "senderUserId" SET NOT NULL;
    RAISE NOTICE '✅ Added: senderUserId NOT NULL on Message';
  ELSE
    RAISE NOTICE '⏭️ Skipped: senderUserId already NOT NULL';
  END IF;
END $$;

-- Ensure orgId is NOT NULL on MessageThread
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'MessageThread' 
      AND column_name = 'orgId'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "MessageThread" ALTER COLUMN "orgId" SET NOT NULL;
    RAISE NOTICE '✅ Added: orgId NOT NULL on MessageThread';
  ELSE
    RAISE NOTICE '⏭️ Skipped: orgId already NOT NULL';
  END IF;
END $$;


-- ============================================================================
-- 5. CLAIMS CONSTRAINTS
-- ============================================================================

\echo ''
\echo '📋 Adding claims constraints...'

-- Ensure orgId is NOT NULL on claims
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'claims' 
      AND column_name = 'orgId'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "claims" ALTER COLUMN "orgId" SET NOT NULL;
    RAISE NOTICE '✅ Added: orgId NOT NULL on claims';
  ELSE
    RAISE NOTICE '⏭️ Skipped: orgId already NOT NULL';
  END IF;
END $$;


-- ============================================================================
-- 6. CLIENT-PRO CONNECTION CONSTRAINTS  
-- ============================================================================

\echo ''
\echo '🤝 Adding ClientProConnection constraints...'

-- Ensure clientId and contractorId are NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ClientProConnection' 
      AND column_name = 'clientId'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "ClientProConnection" ALTER COLUMN "clientId" SET NOT NULL;
    RAISE NOTICE '✅ Added: clientId NOT NULL on ClientProConnection';
  ELSE
    RAISE NOTICE '⏭️ Skipped: clientId already NOT NULL';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ClientProConnection' 
      AND column_name = 'contractorId'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "ClientProConnection" ALTER COLUMN "contractorId" SET NOT NULL;
    RAISE NOTICE '✅ Added: contractorId NOT NULL on ClientProConnection';
  ELSE
    RAISE NOTICE '⏭️ Skipped: contractorId already NOT NULL';
  END IF;
END $$;


-- ============================================================================
-- 7. VALIDATION TRIGGERS (Optional - Advanced)
-- ============================================================================

\echo ''
\echo '⚡ Adding validation triggers...'

-- Trigger to prevent cross-org thread-claim assignment
CREATE OR REPLACE FUNCTION validate_thread_claim_org()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."claimId" IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM "claims" c 
      WHERE c.id = NEW."claimId" AND c."orgId" = NEW."orgId"
    ) THEN
      RAISE EXCEPTION 'Cross-org violation: Thread orgId (%) does not match claim orgId', NEW."orgId";
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_validate_thread_claim_org'
  ) THEN
    CREATE TRIGGER trg_validate_thread_claim_org
      BEFORE INSERT OR UPDATE ON "MessageThread"
      FOR EACH ROW
      EXECUTE FUNCTION validate_thread_claim_org();
    RAISE NOTICE '✅ Added: trg_validate_thread_claim_org trigger';
  ELSE
    RAISE NOTICE '⏭️ Skipped: trg_validate_thread_claim_org (already exists)';
  END IF;
END $$;


-- ============================================================================
-- SUMMARY
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo '✅ DATABASE CONSTRAINT HARDENING — Complete'
\echo '============================================================================'
\echo ''
\echo 'Added constraints:'
\echo '  • no_self_connection — prevents users connecting to themselves'
\echo '  • unique_accepted_connection_pair — prevents duplicate connections'
\echo '  • NOT NULL on critical foreign keys'
\echo '  • Cross-org validation trigger on MessageThread'
\echo ''
\echo 'These constraints will PREVENT future data corruption.'
\echo '============================================================================'
