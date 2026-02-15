-- Migration: Create user_organizations junction table expected by Prisma
-- Date: 2025-11-20
-- NOTE: Prisma schema defines model `user_organizations` with fields:
-- id String @id
-- userId String
-- orgId String
-- role String
-- createdAt DateTime @default(now())
-- Relation: Org (table name "Org") and users table.

-- Ensure pgcrypto available for gen_random_uuid
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_organizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  userId TEXT NOT NULL,
  orgId TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  createdAt TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_user_orgs_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_orgs_org FOREIGN KEY (orgId) REFERENCES "Org"(id) ON DELETE CASCADE
);

-- Indexes matching Prisma schema expectations
CREATE UNIQUE INDEX IF NOT EXISTS user_orgs_user_org_idx ON user_organizations(userId, orgId);
CREATE INDEX IF NOT EXISTS user_orgs_org_idx ON user_organizations(orgId);
CREATE INDEX IF NOT EXISTS user_orgs_user_idx ON user_organizations(userId);
