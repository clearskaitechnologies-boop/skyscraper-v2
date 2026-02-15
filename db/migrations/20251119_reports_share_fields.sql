-- Migration: add share fields to reports (PostgreSQL)
DO $$ BEGIN
	ALTER TABLE reports ADD COLUMN "shareToken" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
	ALTER TABLE reports ADD COLUMN "shareTokenExpiresAt" TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
	ALTER TABLE reports ADD COLUMN "sharedAt" TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
	CREATE UNIQUE INDEX reports_share_token_idx ON reports("shareToken");
EXCEPTION WHEN duplicate_table THEN NULL; END $$;
