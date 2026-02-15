-- Phase 5 Integrations: Vendor Products, Claim Materials, Retail Estimates, Trades Feed

-- Retail Estimates
CREATE TABLE IF NOT EXISTS "RetailEstimate" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- Vendor Products
CREATE TABLE IF NOT EXISTS "VendorProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spec" TEXT,
    "warranty" TEXT,
    "colorJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Claim Materials
CREATE TABLE IF NOT EXISTS "ClaimMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claimId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "vendorId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(65,30),
    "spec" TEXT,
    "warranty" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClaimMaterial_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClaimMaterial_productId_fkey" FOREIGN KEY ("productId") REFERENCES "VendorProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Retail Estimate Items
CREATE TABLE IF NOT EXISTS "RetailEstimateItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estimateId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DECIMAL(65,30),
    "spec" TEXT,
    "warranty" TEXT,
    "color" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RetailEstimateItem_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "RetailEstimate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RetailEstimateItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "VendorProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Trades Feed Engagement
CREATE TABLE IF NOT EXISTS "TradesFeedEngagement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "commentText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS "TradesFeedEngagement_userId_idx" ON "TradesFeedEngagement"("userId");
CREATE INDEX IF NOT EXISTS "TradesFeedEngagement_postId_idx" ON "TradesFeedEngagement"("postId");
CREATE UNIQUE INDEX IF NOT EXISTS "TradesFeedEngagement_postId_userId_key" ON "TradesFeedEngagement"("postId", "userId");
