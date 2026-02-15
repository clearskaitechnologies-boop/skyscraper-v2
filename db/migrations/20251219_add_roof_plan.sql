-- CreateTable: RoofPlan
-- Purpose: Store AI-generated roof plans for claims
-- Phase: OPERATIONALIZATION - RoofPlan Builder Persistence

CREATE TABLE "RoofPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claimId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "RoofPlan_claimId_idx" ON "RoofPlan"("claimId");
CREATE INDEX "RoofPlan_orgId_idx" ON "RoofPlan"("orgId");

COMMENT ON TABLE "RoofPlan" IS 'AI-generated roof plans - saves user inputs and AI outputs for reloading';
COMMENT ON COLUMN "RoofPlan"."input" IS 'User inputs: address, damage type, measurements, photos, etc';
COMMENT ON COLUMN "RoofPlan"."output" IS 'AI-generated plan: sections, materials, costs, timeline, etc';
