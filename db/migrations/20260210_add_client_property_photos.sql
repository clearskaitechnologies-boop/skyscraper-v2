-- ============================================================
-- Migration: Add ClientPropertyPhoto table (multi-photo folders)
-- Date: 2025-02-10
-- Description: Supports categorized photo uploads for clients:
--   property, damage, before, after, documents
-- ============================================================

CREATE TABLE IF NOT EXISTS "ClientPropertyPhoto" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clientId"  TEXT NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
  "folder"    TEXT NOT NULL DEFAULT 'property',
  "url"       TEXT NOT NULL,
  "caption"   TEXT,
  "mimeType"  TEXT,
  "sizeBytes" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ClientPropertyPhoto_clientId_idx"
  ON "ClientPropertyPhoto"("clientId");

CREATE INDEX IF NOT EXISTS "ClientPropertyPhoto_clientId_folder_idx"
  ON "ClientPropertyPhoto"("clientId", "folder");
