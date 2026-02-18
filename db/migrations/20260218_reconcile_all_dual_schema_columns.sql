-- ═══════════════════════════════════════════════════════════════
-- RECONCILE ALL MISSING COLUMNS: public vs app schema
-- Run: psql $DB -f /tmp/reconcile_all_columns.sql
-- ═══════════════════════════════════════════════════════════════

-- ClaimClientLink (6 cols)
ALTER TABLE public."ClaimClientLink" ADD COLUMN IF NOT EXISTS "acceptedAt" TIMESTAMP;
ALTER TABLE public."ClaimClientLink" ADD COLUMN IF NOT EXISTS "clientName" TEXT;
ALTER TABLE public."ClaimClientLink" ADD COLUMN IF NOT EXISTS "clientUserId" TEXT;
ALTER TABLE public."ClaimClientLink" ADD COLUMN IF NOT EXISTS "invitedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public."ClaimClientLink" ADD COLUMN IF NOT EXISTS "invitedBy" TEXT NOT NULL DEFAULT '';
ALTER TABLE public."ClaimClientLink" ADD COLUMN IF NOT EXISTS "sharedDocumentIds" TEXT[] DEFAULT ARRAY[]::text[];

-- Client (4 cols)
ALTER TABLE public."Client" ADD COLUMN IF NOT EXISTS "coverPhotoUrl" TEXT;
ALTER TABLE public."Client" ADD COLUMN IF NOT EXISTS "customStatus" TEXT;
ALTER TABLE public."Client" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN DEFAULT false;
ALTER TABLE public."Client" ADD COLUMN IF NOT EXISTS "statusEmoji" TEXT;

-- ClientWorkRequest (17 cols)
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS budget TEXT;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS "budgetMax" NUMERIC;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS "budgetMin" NUMERIC;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS "coverPhoto" TEXT;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMPTZ;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS "lookingFor" TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS "preferredTypes" TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT ARRAY[]::text[];
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS "responseCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS "serviceArea" TEXT;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS timeline TEXT;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public';
ALTER TABLE public."ClientWorkRequest" ADD COLUMN IF NOT EXISTS zip TEXT;

-- Org (1 col)
ALTER TABLE public."Org" ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- Subscription (3 cols)
ALTER TABLE public."Subscription" ADD COLUMN IF NOT EXISTS "pricePerSeat" INTEGER NOT NULL DEFAULT 8000;
ALTER TABLE public."Subscription" ADD COLUMN IF NOT EXISTS "seatCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public."Subscription" ADD COLUMN IF NOT EXISTS "stripeSubscriptionItemId" TEXT;

-- VendorProduct (4 cols)
ALTER TABLE public."VendorProduct" ADD COLUMN IF NOT EXISTS "colorJson" TEXT;
ALTER TABLE public."VendorProduct" ADD COLUMN IF NOT EXISTS data_sheet_url TEXT;
ALTER TABLE public."VendorProduct" ADD COLUMN IF NOT EXISTS spec TEXT;
ALTER TABLE public."VendorProduct" ADD COLUMN IF NOT EXISTS warranty TEXT;

-- contacts (3 cols)
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS "externalId" TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS "externalSource" TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- email_subscribers (22 cols)
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "bounceCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS categories TEXT[];
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "clientId" TEXT;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "consentDetails" TEXT;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "consentGiven" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "contractorId" UUID;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "emailsClicked" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "emailsOpened" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "emailsSent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "lastEmailSent" TIMESTAMPTZ;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "subscribedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "unsubscribedAt" TIMESTAMPTZ;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "verificationToken" TEXT;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMPTZ;

-- estimates (15 cols)
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS claim_id TEXT;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS dol TIMESTAMP;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS grand_total DOUBLE PRECISION;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS labor_tax_rate DOUBLE PRECISION;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS loss_type TEXT;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS material_tax_rate DOUBLE PRECISION;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS mode TEXT;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS o_and_p_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS overhead_amount DOUBLE PRECISION;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS overhead_percent DOUBLE PRECISION;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS profit_amount DOUBLE PRECISION;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS profit_percent DOUBLE PRECISION;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS source JSONB;
ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS tax_amount DOUBLE PRECISION;

-- file_assets (8 cols)
ALTER TABLE public.file_assets ADD COLUMN IF NOT EXISTS ai_damage TEXT[];
ALTER TABLE public.file_assets ADD COLUMN IF NOT EXISTS ai_tags TEXT[];
ALTER TABLE public.file_assets ADD COLUMN IF NOT EXISTS analysis_status VARCHAR(32);
ALTER TABLE public.file_assets ADD COLUMN IF NOT EXISTS camera_height INTEGER;
ALTER TABLE public.file_assets ADD COLUMN IF NOT EXISTS file_type VARCHAR(32);
ALTER TABLE public.file_assets ADD COLUMN IF NOT EXISTS photo_angle VARCHAR(32);
ALTER TABLE public.file_assets ADD COLUMN IF NOT EXISTS source VARCHAR(32) DEFAULT 'user';
ALTER TABLE public.file_assets ADD COLUMN IF NOT EXISTS "visibleToClient" BOOLEAN NOT NULL DEFAULT false;

-- jobs (2 cols)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS "externalId" TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS "externalSource" TEXT;

-- legal_acceptances (2 cols)
ALTER TABLE public.legal_acceptances ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE public.legal_acceptances ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

-- tradesPost (5 cols)
ALTER TABLE public."tradesPost" ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE public."tradesPost" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE public."tradesPost" ADD COLUMN IF NOT EXISTS "postType" TEXT DEFAULT 'update';
ALTER TABLE public."tradesPost" ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public."tradesPost" ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';

-- users (1 col)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS headshot_url TEXT;

-- frequency enum for email_subscribers — skip if already exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmailFrequency' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    CREATE TYPE public."EmailFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'NEVER');
  END IF;
END $$;
-- email_subscribers frequency column (USER-DEFINED type)
DO $$ BEGIN
  ALTER TABLE public.email_subscribers ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'WEEKLY';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
