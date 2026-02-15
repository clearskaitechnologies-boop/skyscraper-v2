# Supabase Migrations

This directory contains SQL migrations and helper scripts for the project's Supabase/Postgres schema.

Quick commands

- Start local Supabase and apply all migrations:

```bash
supabase start
supabase migration up
```

- Apply a single migration file to a remote DB (use your connection string in $POSTGRES_URL):

```bash
psql "$POSTGRES_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/<timestamp>_your_migration.sql
```

- Roll back using the rollback scripts in `supabase/migrations/rollback/`:

```bash
psql "$POSTGRES_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/rollback/2025-10-25_usage_policies_rollback.sql
```

Safety

- Always snapshot production before applying migrations:

```bash
pg_dump "$POSTGRES_URL" -Fc -f backups/$(date +%F_%H%M)_pre_migration.dump
```

- Migrations are written to be idempotent and safe; they should no-op if objects already exist. Still, review and test in staging before applying to production.

Notes

- I created a migration file `supabase/migrations/20251025_120000_move_org_usage_matview_to_table.sql` containing the main changes (rename MV, create `org_usage_monthly` table, backfill, helper functions, RLS/policies).
- The rollback script is under `supabase/migrations/rollback/2025-10-25_usage_policies_rollback.sql`.

If you want, I can also add CI steps or a Makefile target to run migrations in a consistent way.
