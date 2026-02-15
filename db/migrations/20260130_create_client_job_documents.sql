-- Client portal job documents/photos

CREATE TABLE IF NOT EXISTS app."ClientJobDocument" (
  id         text PRIMARY KEY DEFAULT gen_random_uuid(),
  "jobId"    text NOT NULL,
  "clientId" text NOT NULL,
  type       text NOT NULL,
  title      text NOT NULL,
  url        text NOT NULL,
  "mimeType" text,
  "sizeBytes" integer,
  "uploadedBy" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "ClientJobDocument_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES app."ClientWorkRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClientJobDocument_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES app."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ClientJobDocument_jobId_idx" ON app."ClientJobDocument"("jobId");
CREATE INDEX IF NOT EXISTS "ClientJobDocument_clientId_idx" ON app."ClientJobDocument"("clientId");
CREATE INDEX IF NOT EXISTS "ClientJobDocument_type_idx" ON app."ClientJobDocument"(type);