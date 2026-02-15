# Clerk + Supabase JWT Integration Setup

## Overview

This guide configures Clerk to issue JWTs that work with Supabase RLS policies.

## Step 1: Create Clerk JWT Template

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to **JWT Templates** (in the sidebar)
3. Click **"+ New template"**
4. Select **"Supabase"** from the list
5. Template name: `supabase`
6. Click **"Apply changes"**

This creates a JWT template that includes the Supabase-required claims.

## Step 2: Configure Supabase Settings

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Scroll to **"JWT Secret"**
4. Copy your **JWT Secret** (starts with `ey...`)

## Step 3: Configure Clerk to Sign JWTs with Supabase Secret

1. Back in Clerk Dashboard → **JWT Templates** → **supabase**
2. Click **"Configure"**
3. Under **"Signing key"**, paste your Supabase JWT Secret
4. Under **"Claims"**, ensure these are present:
   ```json
   {
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "user_metadata": {
       "full_name": "{{user.full_name}}"
     }
   }
   ```
5. Save changes

## Step 4: Update RLS Policies

RLS policies should now use Clerk's JWT claims:

```sql
-- OLD (Supabase Auth)
CREATE POLICY "users_own_posts"
ON trades_posts FOR SELECT
USING (auth.uid() = user_id);

-- NEW (Clerk Auth)
CREATE POLICY "users_own_posts"
ON trades_posts FOR SELECT
USING ((current_setting('request.jwt.claims', true)::json->>'sub')::uuid = user_id);
```

Or use a helper function:

```sql
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$;

-- Then in policies:
CREATE POLICY "users_own_posts"
ON trades_posts FOR SELECT
USING (auth_user_id() = user_id);
```

## Step 5: Test Integration

```typescript
// In your API route
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const { supabase, userId } = await createSupabaseServerClient();

  // This query will be scoped to the authenticated user via RLS
  const { data } = await supabase.from("trades_posts").select("*");

  return Response.json({ data, userId });
}
```

## Step 6: Verify JWT is Working

Run this SQL in Supabase SQL Editor to test:

```sql
-- Should return the current user's ID from JWT
SELECT (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;

-- If it returns NULL, the JWT isn't being passed correctly
```

## Troubleshooting

### Issue: RLS blocks everything

**Cause**: JWT not being passed to Supabase  
**Fix**: Ensure `getToken({ template: "supabase" })` is called in server client

### Issue: Invalid JWT signature

**Cause**: Clerk JWT template using wrong signing key  
**Fix**: Double-check Supabase JWT Secret is pasted correctly in Clerk

### Issue: `auth.uid()` returns NULL

**Cause**: Using Supabase Auth functions with Clerk  
**Fix**: Replace `auth.uid()` with custom `auth_user_id()` helper function

## Environment Variables Required

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # For admin operations

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Implementation Checklist

- [ ] Created Clerk JWT template named "supabase"
- [ ] Configured template with Supabase JWT Secret
- [ ] Updated RLS policies to use `auth_user_id()` helper
- [ ] Tested API route with `createSupabaseServerClient()`
- [ ] Verified JWT claims in Supabase SQL Editor
- [ ] All environment variables set in Vercel/production
