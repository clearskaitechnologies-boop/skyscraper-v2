# Deployment Notes: Ensure `users.headshot_url`

## Purpose

Guarantee the `users.headshot_url` column exists in every environment. The Prisma model `users` maps `headshotUrl String? @map("headshot_url")` and pages/components select this field optionally. Missing column caused runtime errors during lead creation and other user lookups.

## Verification

Run this in any environment to verify presence (should return one row):

```bash
psql "$DATABASE_URL" -f scripts/verify-headshot-url-column.sql
```

If no row is returned, apply the migration below.

## Fix (Idempotent)

Apply the migration to safely add the column if missing:

```bash
psql "$DATABASE_URL" -f db/migrations/20251120_ensure_users_headshot_url.sql
```

The statement uses `ADD COLUMN IF NOT EXISTS` so it is safe to run repeatedly.

## Alternative (Prisma Migrate Deploy)

If your production flow relies on Prisma migrations:

```bash
npx prisma migrate deploy
```

Ensure the new SQL migration file is committed before running the above.

## Post-Deployment Validation

1. Re-run verification script.
2. Hit `/api/leads` POST via the UI (Create Lead) – should succeed without headshotUrl.
3. Load a Team Member page and confirm no 500 error.

## Notes

The field is optional. Components must use null-safe access: `user?.headshotUrl ?? null`.
