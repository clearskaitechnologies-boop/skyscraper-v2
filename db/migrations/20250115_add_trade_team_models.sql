-- Migration: Add Trade Team Models
-- Created: 2025-01-15
-- Description: Adds customer_accounts, customer_properties, and customer_contractor_links tables

-- Create customer_accounts table
CREATE TABLE IF NOT EXISTS "customer_accounts" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "role" TEXT NOT NULL DEFAULT 'HOMEOWNER',
  "name" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "avatarUrl" TEXT,
  "bio" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create customer_properties table
CREATE TABLE IF NOT EXISTS "customer_properties" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zip" TEXT NOT NULL,
  "propertyType" TEXT,
  "units" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "customer_properties_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customer_accounts"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create customer_contractor_links table
CREATE TABLE IF NOT EXISTS "customer_contractor_links" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "contractorId" TEXT NOT NULL,
  "propertyId" TEXT,
  "trade" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "nickname" TEXT,
  "notes" TEXT,
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastJobDate" TIMESTAMP(3),
  "totalJobs" INTEGER NOT NULL DEFAULT 0,
  
  CONSTRAINT "customer_contractor_links_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "customer_accounts"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  CONSTRAINT "customer_contractor_links_contractorId_fkey" 
    FOREIGN KEY ("contractorId") REFERENCES "Org"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  CONSTRAINT "customer_contractor_links_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "customer_properties"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "customer_properties_customerId_idx" 
  ON "customer_properties"("customerId");

CREATE INDEX IF NOT EXISTS "customer_contractor_links_customerId_trade_idx" 
  ON "customer_contractor_links"("customerId", "trade");

CREATE INDEX IF NOT EXISTS "customer_contractor_links_contractorId_idx" 
  ON "customer_contractor_links"("contractorId");

-- Create unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "customer_contractor_links_customerId_contractorId_trade_propertyId_key" 
  ON "customer_contractor_links"("customerId", "contractorId", "trade", "propertyId");

-- Success message
SELECT 'Trade Team models created successfully' AS status;
