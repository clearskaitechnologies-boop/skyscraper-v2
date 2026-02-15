# Production Database Migration

## Vendors Table Migration

**File**: `2025-11-26_create_vendors_table_final.sql`

### Quick Steps

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your production database
3. Click **SQL Editor** in left sidebar
4. Copy contents of `2025-11-26_create_vendors_table_final.sql`
5. Paste into SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

### Verify

Run this query after migration:

```sql
SELECT COUNT(*) FROM vendors;
```

Expected result: `0` (table exists but empty)

### What This Does

- Creates `vendors` table with proper schema
- Adds performance indexes
- Idempotent (safe to run multiple times)
- No destructive operations

### After Migration

The app will:

- ✅ Load `/app/dashboard` without crashing
- ✅ Show clean empty state on `/app/vendors`
- ✅ Allow adding vendors via UI

**Time Required**: 2 minutes
