DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Org'
  ) THEN
    CREATE TABLE "Org" (
      id TEXT PRIMARY KEY,
      "clerkOrgId" TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      "planId" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "stripeCustomerId" TEXT,
      "stripeSubscriptionId" TEXT,
      "subscriptionStatus" TEXT,
      "trialStartAt" TIMESTAMPTZ,
      "trialEndsAt" TIMESTAMPTZ,
      "trialStatus" TEXT,
      "planKey" TEXT,
      "sentTrialT24" BOOLEAN NOT NULL DEFAULT FALSE,
      "sentTrialT1" BOOLEAN NOT NULL DEFAULT FALSE,
      "referralCode" TEXT UNIQUE,
      "brandLogoUrl" TEXT,
      "pdfFooterText" TEXT,
      "pdfHeaderText" TEXT,
      "videoEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
      "videoPlanTier" TEXT,
      "aiModeDefault" TEXT NOT NULL DEFAULT 'auto',
      "aiCacheEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
      "aiCacheTTL" INT NOT NULL DEFAULT 604800,
      "aiDedupeEnabled" BOOLEAN NOT NULL DEFAULT TRUE
    );
    CREATE INDEX idx_org_subscription_status ON "Org"("subscriptionStatus");
    CREATE INDEX idx_org_stripe_customer ON "Org"("stripeCustomerId");
    RAISE NOTICE '✅ Org table created';
  ELSE
    RAISE NOTICE '✅ Org table already exists';
  END IF;
END $$;