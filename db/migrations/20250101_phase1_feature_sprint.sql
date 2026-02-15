-- ============================================================================
-- Migration: Phase 1 Feature Sprint
-- Date: 2025-01-XX
-- Features: SMS Messages, Customer Payments, Permits, Mortgage Checks
-- NOTE: sms_messages may already exist from prior run; IF NOT EXISTS is safe.
-- NOTE: crm_jobs table doesn't exist in DB yet — jobId is a soft reference.
-- ============================================================================

-- ─── SMS Messages ────────────────────────────────────────────────────────────
-- (may already exist from partial prior run)
CREATE TABLE IF NOT EXISTS sms_messages (
  id              TEXT PRIMARY KEY,
  "orgId"         TEXT NOT NULL REFERENCES "Org"(id) ON DELETE CASCADE,
  "contactId"     TEXT REFERENCES contacts(id),
  direction       TEXT NOT NULL,
  "from"          TEXT NOT NULL,
  "to"            TEXT NOT NULL,
  body            TEXT NOT NULL,
  "externalId"    TEXT,
  status          TEXT NOT NULL DEFAULT 'sent',
  "sentBy"        TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_messages_org_contact ON sms_messages("orgId", "contactId");
CREATE INDEX IF NOT EXISTS idx_sms_messages_org_created ON sms_messages("orgId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_sms_messages_contact_created ON sms_messages("contactId", "createdAt");

-- ─── Customer Payments ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_payments (
  id                  TEXT PRIMARY KEY,
  "orgId"             TEXT NOT NULL REFERENCES "Org"(id) ON DELETE CASCADE,
  "jobId"             TEXT,
  "invoiceId"         TEXT,
  "amountCents"       INTEGER NOT NULL,
  description         TEXT NOT NULL,
  "customerEmail"     TEXT,
  "customerName"      TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',
  provider            TEXT NOT NULL DEFAULT 'stripe',
  "stripeSessionId"   TEXT,
  "stripePaymentId"   TEXT,
  "paymentUrl"        TEXT,
  "paidAt"            TIMESTAMPTZ,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_payments_org_status ON customer_payments("orgId", status);
CREATE INDEX IF NOT EXISTS idx_customer_payments_job ON customer_payments("jobId");
CREATE INDEX IF NOT EXISTS idx_customer_payments_stripe ON customer_payments("stripeSessionId");

-- ─── Permits ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permits (
  id                  TEXT PRIMARY KEY,
  "orgId"             TEXT NOT NULL REFERENCES "Org"(id) ON DELETE CASCADE,
  "jobId"             TEXT,
  "claimId"           TEXT REFERENCES claims(id),
  "propertyId"        TEXT,
  "permitNumber"      TEXT NOT NULL,
  "permitType"        TEXT NOT NULL,
  jurisdiction        TEXT,
  status              TEXT NOT NULL DEFAULT 'applied',
  "appliedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "approvedAt"        TIMESTAMPTZ,
  "issuedAt"          TIMESTAMPTZ,
  "expiresAt"         TIMESTAMPTZ,
  "inspectionDate"    TIMESTAMPTZ,
  "inspectionNotes"   TEXT,
  fee                 DECIMAL(10,2),
  notes               TEXT,
  "documentUrl"       TEXT,
  "createdBy"         TEXT,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permits_org_status ON permits("orgId", status);
CREATE INDEX IF NOT EXISTS idx_permits_job ON permits("jobId");
CREATE INDEX IF NOT EXISTS idx_permits_claim ON permits("claimId");
CREATE INDEX IF NOT EXISTS idx_permits_number ON permits("permitNumber");

-- ─── Mortgage Checks ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mortgage_checks (
  id                  TEXT PRIMARY KEY,
  "orgId"             TEXT NOT NULL REFERENCES "Org"(id) ON DELETE CASCADE,
  "claimId"           TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  "jobId"             TEXT,
  "checkNumber"       TEXT,
  amount              DECIMAL(10,2) NOT NULL,
  lender              TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending',
  "expectedDate"      TIMESTAMPTZ,
  "receivedDate"      TIMESTAMPTZ,
  "endorsedDate"      TIMESTAMPTZ,
  "depositedDate"     TIMESTAMPTZ,
  "clearedDate"       TIMESTAMPTZ,
  notes               TEXT,
  "createdBy"         TEXT,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mortgage_checks_org_status ON mortgage_checks("orgId", status);
CREATE INDEX IF NOT EXISTS idx_mortgage_checks_claim ON mortgage_checks("claimId");
CREATE INDEX IF NOT EXISTS idx_mortgage_checks_job ON mortgage_checks("jobId");

-- ─── Done ────────────────────────────────────────────────────────────────────
-- Run: psql "$DATABASE_URL" -f ./db/migrations/20250101_phase1_feature_sprint.sql
