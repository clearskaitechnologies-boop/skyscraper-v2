-- Migration: Create Client Portal Tables
-- Created: 2025-11-28
-- Description: Add Client, ClientPortalAccess, ClientNotification, and ClientCompanyFollow tables for client portal functionality
-- NOTE: This file uses PostgreSQL syntax. VS Code SQL linter may show errors if configured for SQL Server - these can be ignored.

SET search_path TO app;

-- Create Client table
CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Client_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Client_orgId_idx" ON "Client"("orgId");
CREATE INDEX IF NOT EXISTS "Client_email_idx" ON "Client"("email");

-- Create ClientPortalAccess table
CREATE TABLE IF NOT EXISTS "client_portal_access" (
    "id" TEXT PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "client_portal_access_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "client_portal_access_clientId_idx" ON "client_portal_access"("clientId");
CREATE INDEX IF NOT EXISTS "client_portal_access_claimId_idx" ON "client_portal_access"("claimId");
CREATE INDEX IF NOT EXISTS "client_portal_access_token_idx" ON "client_portal_access"("token");

-- Create ClientNotification table
CREATE TABLE IF NOT EXISTS "ClientNotification" (
    "id" TEXT PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientNotification_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ClientNotification_clientId_idx" ON "ClientNotification"("clientId");
CREATE INDEX IF NOT EXISTS "ClientNotification_read_idx" ON "ClientNotification"("read");

-- Create ClientCompanyFollow table
CREATE TABLE IF NOT EXISTS "ClientCompanyFollow" (
    "id" TEXT PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientCompanyFollow_clientId_companyId_unique" UNIQUE ("clientId", "companyId")
);

CREATE INDEX IF NOT EXISTS "ClientCompanyFollow_clientId_idx" ON "ClientCompanyFollow"("clientId");
CREATE INDEX IF NOT EXISTS "ClientCompanyFollow_companyId_idx" ON "ClientCompanyFollow"("companyId");

-- Create function to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_client_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updatedAt on Client table
DROP TRIGGER IF EXISTS update_client_updated_at_trigger ON "Client";
CREATE TRIGGER update_client_updated_at_trigger
    BEFORE UPDATE ON "Client"
    FOR EACH ROW
    EXECUTE FUNCTION update_client_updated_at();

-- Output confirmation
DO $$ 
BEGIN 
    RAISE NOTICE 'Client portal tables created successfully!';
END $$;
