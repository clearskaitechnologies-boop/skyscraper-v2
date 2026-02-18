# Schema Policy — SkaiScraper Platform

> **Last Updated:** 2026-02-18
> **Status:** Enforced
> **Author:** Enterprise Hardening Sprint

---

## The Problem We Solved

Our Supabase PostgreSQL database had **two schemas**: `public` and `app`.

- **`public` schema** — Prisma's default target. All Prisma Client queries resolve here first.
- **`app` schema** — Created by Supabase migrations. Tables evolved here independently.

Over time, **185 tables** existed only in `app` (never mirrored to `public`), and **81 tables** existed in both schemas but with divergent column definitions. This caused:

- Runtime crashes (`column does not exist`)
- Silent empty states (pages rendering nothing)
- Unpredictable auth/redirect behavior
- Feature flags failing silently

## The Fix

### 1. Search Path (Systemic)

```
search_path = public, app, extensions
```

Applied via:
- `ALTER ROLE postgres SET search_path TO public, app, extensions;`
- `ALTER DATABASE postgres SET search_path TO public, app, extensions;`
- `options=-csearch_path%3Dpublic%2Capp%2Cextensions` in `DATABASE_URL` and `DIRECT_DATABASE_URL`

This means PostgreSQL resolves table names by looking in `public` first, then `app`, then `extensions`. Tables that exist in both schemas use the `public` version (which has our reconciled columns).

### 2. Column Reconciliation (Targeted)

For the 81 tables that exist in **both** schemas, we added all missing columns to `public` to match the Prisma schema definitions. See: `db/migrations/20260218_reconcile_public_schema.sql`

---

## Rules Going Forward

### Rule 1: All New Migrations Target `public` Schema Only

```sql
-- ✅ CORRECT
ALTER TABLE public.claims ADD COLUMN new_field TEXT;

-- ❌ WRONG — creates drift
ALTER TABLE app.claims ADD COLUMN new_field TEXT;
```

### Rule 2: Prisma Schema Is Source of Truth

The `prisma/schema.prisma` file defines the canonical column set. If you add a field to Prisma, you must also add the column to `public` schema (or run `prisma migrate`).

### Rule 3: Never Create Tables in `app` Schema Directly

If Supabase migrations create tables in `app`, they must also be created in `public` — or rely on the search_path fallback. The search_path ensures `app` tables are accessible, but new features should always target `public`.

### Rule 4: Check Both Schemas Before Adding Columns

```sql
-- Before any ALTER TABLE, check what exists where:
SELECT table_schema, column_name
FROM information_schema.columns
WHERE table_name = 'your_table'
ORDER BY table_schema, ordinal_position;
```

### Rule 5: Migration Files Go in `db/migrations/`

Document every schema change in a dated SQL file:
```
db/migrations/YYYYMMDD_description.sql
```

These are applied manually and serve as audit trail.

---

## Schema Inventory (As of 2026-02-18)

| Location | Count | Description |
|----------|-------|-------------|
| `public` only | 28 tables | Prisma-managed, no `app` equivalent |
| `app` only | 185 tables | Accessible via search_path fallback |
| Both schemas | 81 tables | `public` takes priority, columns reconciled |
| **Total Prisma models** | **260** | All resolvable via search_path |

## Connection Strings

```
# Runtime (PgBouncer pooled)
DATABASE_URL="postgresql://...@host:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20&options=-csearch_path%3Dpublic%2Capp%2Cextensions"

# Migrations (direct)
DIRECT_DATABASE_URL="postgresql://...@host:5432/postgres?options=-csearch_path%3Dpublic%2Capp%2Cextensions"
```

## Future Considerations

1. **Long-term goal:** Migrate all 185 `app`-only tables into `public` schema, then drop the `app` schema entirely.
2. **Prisma `multiSchema` preview feature:** When stable, could replace search_path with explicit `@@schema()` annotations per model. Not recommended yet (260 models to annotate).
3. **Supabase migrations:** If using `supabase db push` or `supabase migration`, ensure they target `public` or verify the search_path is respected.
