-- CreateTable: job_drafts
-- Migration for JobDraft model to support wizard auto-save

CREATE TABLE IF NOT EXISTS "job_drafts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orgId" TEXT,
    "step" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "job_drafts_userId_idx" ON "job_drafts"("userId");
CREATE INDEX IF NOT EXISTS "job_drafts_orgId_idx" ON "job_drafts"("orgId");

-- Add comment
COMMENT ON TABLE "job_drafts" IS 'Stores wizard draft data with auto-save support';
