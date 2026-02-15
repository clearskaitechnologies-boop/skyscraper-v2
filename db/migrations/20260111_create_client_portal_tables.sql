-- =============================================================================
-- Create Client Portal Tables
-- Date: 2026-01-11
-- Description: Creates core client portal tables for self-service clients
-- =============================================================================

-- Ensure app schema exists
CREATE SCHEMA IF NOT EXISTS app;

-- =============================================================================
-- CLIENT TABLE
-- Core client profile for portal users
-- =============================================================================

CREATE TABLE IF NOT EXISTS app."Client" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT UNIQUE,
  "orgId" TEXT,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "companyName" TEXT,
  "category" TEXT NOT NULL DEFAULT 'Homeowner',
  "avatarUrl" TEXT,
  "propertyPhotoUrl" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postal" TEXT,
  "preferredContact" TEXT DEFAULT 'email',
  "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
  "notifySms" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'active',
  "lastActiveAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT "Client_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES app."Org"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS "Client_orgId_idx" ON app."Client"("orgId");
CREATE INDEX IF NOT EXISTS "Client_email_idx" ON app."Client"("email");
CREATE INDEX IF NOT EXISTS "Client_status_idx" ON app."Client"("status");
CREATE INDEX IF NOT EXISTS "Client_category_idx" ON app."Client"("category");

-- =============================================================================
-- CLIENT PRO CONNECTION TABLE
-- Links clients to contractors/pros
-- =============================================================================

CREATE TABLE IF NOT EXISTS app."ClientProConnection" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "contractorId" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "invitedBy" TEXT,
  "notes" TEXT,
  "invitedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "connectedAt" TIMESTAMPTZ,
  
  CONSTRAINT "ClientProConnection_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES app."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClientProConnection_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES app."tradesCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClientProConnection_clientId_contractorId_key" UNIQUE ("clientId", "contractorId")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ClientProConnection_clientId_idx" ON app."ClientProConnection"("clientId");
CREATE INDEX IF NOT EXISTS "ClientProConnection_contractorId_idx" ON app."ClientProConnection"("contractorId");
CREATE INDEX IF NOT EXISTS "ClientProConnection_status_idx" ON app."ClientProConnection"("status");

-- =============================================================================
-- CLIENT SAVED PRO TABLE
-- Pros saved by clients (like Pokemon collection!)
-- =============================================================================

CREATE TABLE IF NOT EXISTS app."ClientSavedPro" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "companyId" UUID NOT NULL,
  "category" TEXT,
  "notes" TEXT,
  "savedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT "ClientSavedPro_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES app."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClientSavedPro_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES app."tradesCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClientSavedPro_clientId_companyId_key" UNIQUE ("clientId", "companyId")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ClientSavedPro_clientId_idx" ON app."ClientSavedPro"("clientId");
CREATE INDEX IF NOT EXISTS "ClientSavedPro_companyId_idx" ON app."ClientSavedPro"("companyId");
CREATE INDEX IF NOT EXISTS "ClientSavedPro_category_idx" ON app."ClientSavedPro"("category");

-- =============================================================================
-- CLIENT WORK REQUEST TABLE
-- Work requests that go to specific pros OR to job board
-- =============================================================================

CREATE TABLE IF NOT EXISTS app."ClientWorkRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "targetProId" UUID,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "urgency" TEXT NOT NULL DEFAULT 'normal',
  "preferredDate" TIMESTAMPTZ,
  "propertyAddress" TEXT,
  "propertyPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT "ClientWorkRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES app."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClientWorkRequest_targetProId_fkey" FOREIGN KEY ("targetProId") REFERENCES app."tradesCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ClientWorkRequest_clientId_idx" ON app."ClientWorkRequest"("clientId");
CREATE INDEX IF NOT EXISTS "ClientWorkRequest_targetProId_idx" ON app."ClientWorkRequest"("targetProId");
CREATE INDEX IF NOT EXISTS "ClientWorkRequest_status_idx" ON app."ClientWorkRequest"("status");
CREATE INDEX IF NOT EXISTS "ClientWorkRequest_category_idx" ON app."ClientWorkRequest"("category");

-- =============================================================================
-- DONE
-- =============================================================================

-- Add comment to track migration
COMMENT ON TABLE app."Client" IS 'Client portal user profiles - self-service clients who use the portal';
COMMENT ON TABLE app."ClientProConnection" IS 'Links between clients and trade professionals';
COMMENT ON TABLE app."ClientSavedPro" IS 'Saved pros - clients can collect pros like Pokemon!';
COMMENT ON TABLE app."ClientWorkRequest" IS 'Work requests from clients - either to specific pros or posted to job board';
