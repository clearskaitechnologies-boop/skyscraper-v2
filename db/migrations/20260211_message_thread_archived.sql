-- Add archivedAt to MessageThread for soft-archive (distinct from hard delete)
ALTER TABLE "MessageThread"
  ADD COLUMN IF NOT EXISTS "archivedAt"   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "archivedBy"   TEXT;

-- Index for filtering out archived threads efficiently
CREATE INDEX IF NOT EXISTS "idx_MessageThread_archivedAt"
  ON "MessageThread" ("archivedAt") WHERE "archivedAt" IS NULL;
