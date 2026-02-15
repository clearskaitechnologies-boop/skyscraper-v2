-- User Agreements & Email Preferences Migration
-- Version: 2026-01-28
-- ClearSkai Technologies, LLC

-- ============================================
-- LEGAL ACCEPTANCES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS "legal_acceptances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "legal_acceptances_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint to prevent duplicate acceptances
CREATE UNIQUE INDEX IF NOT EXISTS "legal_acceptances_userId_documentId_version_key" 
    ON "legal_acceptances"("userId", "documentId", "version");

-- Create index for fast lookups by user
CREATE INDEX IF NOT EXISTS "legal_acceptances_userId_documentId_idx" 
    ON "legal_acceptances"("userId", "documentId");

CREATE INDEX IF NOT EXISTS "legal_acceptances_userId_idx" 
    ON "legal_acceptances"("userId");

COMMENT ON TABLE "legal_acceptances" IS 'Tracks user acceptance of legal documents for compliance and audit purposes';
COMMENT ON COLUMN "legal_acceptances"."userId" IS 'Clerk user ID';
COMMENT ON COLUMN "legal_acceptances"."documentId" IS 'Legal document identifier (e.g., tos, privacy, client-agreement, pro-agreement)';
COMMENT ON COLUMN "legal_acceptances"."version" IS 'Version of the document accepted (e.g., 2026-01)';
COMMENT ON COLUMN "legal_acceptances"."acceptedAt" IS 'Timestamp when user accepted the document';
COMMENT ON COLUMN "legal_acceptances"."ipAddress" IS 'IP address at time of acceptance for audit trail';
COMMENT ON COLUMN "legal_acceptances"."userAgent" IS 'Browser/device info at time of acceptance';

-- ============================================
-- USER EMAIL PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "user_email_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "productUpdates" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT false,
    "partnerOffers" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribedAt" TIMESTAMP(3) WITH TIME ZONE,
    "optInTimestamp" TIMESTAMP(3) WITH TIME ZONE,
    "optInSource" TEXT,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_email_preferences_pkey" PRIMARY KEY ("id")
);

-- One preference record per user
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_preferences_userId_key" 
    ON "user_email_preferences"("userId");

-- Index for email lookups (for unsubscribe links)
CREATE INDEX IF NOT EXISTS "user_email_preferences_email_idx" 
    ON "user_email_preferences"("email");

COMMENT ON TABLE "user_email_preferences" IS 'User email and marketing communication preferences';
COMMENT ON COLUMN "user_email_preferences"."marketingOptIn" IS 'User consented to marketing emails';
COMMENT ON COLUMN "user_email_preferences"."productUpdates" IS 'Receive product update notifications';
COMMENT ON COLUMN "user_email_preferences"."securityAlerts" IS 'Receive security-related alerts (always recommended)';
COMMENT ON COLUMN "user_email_preferences"."weeklyDigest" IS 'Receive weekly activity digest';
COMMENT ON COLUMN "user_email_preferences"."partnerOffers" IS 'Receive partner/third-party offers';
COMMENT ON COLUMN "user_email_preferences"."optInSource" IS 'Where user opted in: signup, settings, campaign';

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Tables created successfully' AS status;
SELECT COUNT(*) AS legal_acceptances_count FROM legal_acceptances;
SELECT COUNT(*) AS email_preferences_count FROM user_email_preferences;
