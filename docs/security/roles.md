# Role Management & Elevation

## Overview

ClearSKai implements role-based access control (RBAC) using a dedicated `user_roles` table separate from user profiles. This prevents privilege escalation attacks and ensures secure role management.

## Available Roles

| Role        | Permissions           | Description                                         |
| ----------- | --------------------- | --------------------------------------------------- |
| `owner`     | Full access           | Can manage all users, roles, and system settings    |
| `admin`     | Administrative access | Can manage incidents, view all leads/reports/events |
| `moderator` | Content moderation    | Reserved for future use                             |
| `viewer`    | Read-only access      | Default role for new users                          |

## Automatic Role Assignment

### First User (Owner)

The **first user** to sign up is automatically assigned the **owner** role:

```sql
-- Trigger: handle_new_user_role
-- When: First user signs up
-- Result: Assigned 'owner' role
```

**Verification:**

```sql
SELECT u.email, r.role, r.created_at
FROM auth.users u
JOIN user_roles r ON r.user_id = u.id
ORDER BY r.created_at ASC
LIMIT 1;
```

Expected: First user has `role = 'owner'`

### Subsequent Users (Viewers)

All users after the first are automatically assigned the **viewer** role:

```sql
-- Trigger: handle_new_user_role
-- When: Any user signs up (after first)
-- Result: Assigned 'viewer' role
```

## Role Elevation Process

### Promoting Users to Admin

**Prerequisites:**

- You must be an **owner** to promote users
- Target user must exist in the system
- Target user must currently be a **viewer**

**Steps:**

1. **Identify target user:**

```sql
SELECT id, email FROM auth.users WHERE email = 'user@example.com';
```

2. **Promote to admin:**

```sql
-- Insert new role
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user_id>', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Log the change for audit
INSERT INTO public.role_changes (changed_by, target_user, old_role, new_role, reason)
VALUES (auth.uid(), '<user_id>', 'viewer', 'admin', 'Promoted by owner');
```

3. **Verify promotion:**

```sql
SELECT role FROM public.user_roles WHERE user_id = '<user_id>';
```

Expected: Returns both `viewer` and `admin` roles

### Promoting Users to Owner

**⚠️ Warning:** Be extremely careful when promoting users to owner. Owners have full system access.

**Steps:**

1. **Confirm necessity:**
   - Is this user trusted?
   - Do they need full system access?
   - Have they been properly trained?

2. **Promote to owner:**

```sql
-- Insert owner role
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user_id>', 'owner')
ON CONFLICT (user_id, role) DO NOTHING;

-- Log the change
INSERT INTO public.role_changes (changed_by, target_user, old_role, new_role, reason)
VALUES (auth.uid(), '<user_id>', 'admin', 'owner', 'Promoted to co-owner by [YOUR_NAME]');
```

3. **Notify the team:**
   - Send email to all existing owners
   - Document the change in team notes
   - Update access control documentation

### Demoting Users

**Steps:**

1. **Remove role:**

```sql
-- Remove admin role
DELETE FROM public.user_roles
WHERE user_id = '<user_id>' AND role = 'admin';

-- Log the change
INSERT INTO public.role_changes (changed_by, target_user, old_role, new_role, reason)
VALUES (auth.uid(), '<user_id>', 'admin', 'viewer', 'Demoted due to [REASON]');
```

2. **Verify demotion:**

```sql
SELECT role FROM public.user_roles WHERE user_id = '<user_id>';
```

Expected: Returns only `viewer` role

## Audit Trail

All role changes are automatically logged to the `role_changes` table:

```sql
-- View all role changes
SELECT
  rc.changed_at,
  u1.email as changed_by,
  u2.email as target_user,
  rc.old_role,
  rc.new_role,
  rc.reason
FROM role_changes rc
JOIN auth.users u1 ON u1.id = rc.changed_by
JOIN auth.users u2 ON u2.id = rc.target_user
ORDER BY rc.changed_at DESC;
```

**Audit Fields:**

- `changed_by`: User who made the change
- `target_user`: User whose role was changed
- `old_role`: Previous role (NULL for new users)
- `new_role`: New role assigned
- `reason`: Free-text explanation
- `changed_at`: Timestamp of change

## RLS Policies

### user_roles Table

**View own roles:**

```sql
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);
```

**Manage all roles (owners only):**

```sql
-- Owners can manage all roles
CREATE POLICY "Owners can manage all roles"
ON user_roles FOR ALL
USING (has_role(auth.uid(), 'owner'));
```

### role_changes Table

**View own changes:**

```sql
-- Users can view their own role changes
CREATE POLICY "Users can view their own role changes"
ON role_changes FOR SELECT
USING (target_user = auth.uid());
```

**View all changes (admins/owners):**

```sql
-- Admins can view all role changes
CREATE POLICY "Admins can view all role changes"
ON role_changes FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));
```

## Security Best Practices

### ✅ DO:

- Always log role changes with a reason
- Verify target user identity before promotion
- Notify team when promoting to owner
- Regularly audit role changes
- Remove roles when users leave
- Use `has_role()` function in RLS policies

### ❌ DON'T:

- Store roles in user profiles or JWT claims
- Allow users to self-promote
- Skip audit logging
- Grant owner role casually
- Trust client-side role checks
- Bypass RLS policies

## API Integration

### Check User Role (Frontend)

```typescript
import { supabase } from "@/integrations/supabase/client";

async function checkUserRole(role: "admin" | "owner" | "viewer") {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", role)
    .single();

  return !!data;
}

// Usage
const isAdmin = await checkUserRole("admin");
if (isAdmin) {
  // Show admin UI
}
```

### Backend Role Check (Edge Functions)

```typescript
// In edge function
const {
  data: { user },
} = await supabase.auth.getUser();

const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);

const isAdmin = roles?.some((r) => r.role === "admin" || r.role === "owner");

if (!isAdmin) {
  return new Response(JSON.stringify({ error: "Insufficient permissions" }), { status: 403 });
}
```

## Troubleshooting

### User doesn't have expected role

**Check current roles:**

```sql
SELECT role FROM user_roles WHERE user_id = '<user_id>';
```

**Check trigger is working:**

```sql
SELECT * FROM pg_trigger WHERE tgname = 'handle_new_user_role';
```

### Role change not logged

**Check role_changes table:**

```sql
SELECT * FROM role_changes
WHERE target_user = '<user_id>'
ORDER BY changed_at DESC;
```

**Verify INSERT permissions:**

```sql
-- Should allow inserts for logged role changes
SELECT * FROM pg_policies
WHERE tablename = 'role_changes';
```

### First user not owner

**Manual fix:**

```sql
-- Remove viewer role
DELETE FROM user_roles WHERE user_id = '<first_user_id>' AND role = 'viewer';

-- Add owner role
INSERT INTO user_roles (user_id, role)
VALUES ('<first_user_id>', 'owner');

-- Log the correction
INSERT INTO role_changes (changed_by, target_user, old_role, new_role, reason)
VALUES ('<first_user_id>', '<first_user_id>', 'viewer', 'owner', 'Manual correction - first user');
```

## Migration History

- **2025-10-16:** Created `role_changes` audit table
- **2025-10-16:** Updated `handle_new_user_role` trigger for first user = owner
- **2025-10-16:** Added RLS policies for audit trail

---

**Last Updated:** October 16, 2025  
**Maintained By:** Security Team  
**Contact:** security@clearskai.com
