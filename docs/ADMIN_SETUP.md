# Admin Authentication Setup

## Overview

This project now has a complete admin authentication system integrated with GoDaddy/Microsoft 365 email.

## Components Created

### 1. Admin Sign-In Page

- **Route**: `/admin/signin`
- **Location**: `src/pages/AdminSignIn.tsx`
- Validates credentials and checks for admin role before granting access

### 2. Admin Wrapper Component

- **Location**: `src/components/AdminOnly.tsx`
- Wrap any component with `<AdminOnly>` to restrict access to admin users only
- Shows loading state while checking permissions
- Redirects non-admin users with a friendly message

### 3. Email System

- **Edge Function**: `supabase/functions/send-email/index.ts`
- Configured to use Microsoft 365 SMTP (smtp.office365.com:587)
- Uses environment variables for credentials

## Granting Admin Access

### Option 1: Using Lovable Backend (Recommended)

1. Open your backend:

   ```xml
   <lov-actions>
     <lov-open-backend>View Backend</lov-open-backend>
   </lov-actions>
   ```

2. Go to SQL Editor and run:
   ```sql
   -- Grant admin role to a user by email
   insert into public.user_roles (user_id, role)
   select id, 'admin'
   from auth.users
   where email = 'Damien@clearskairoofing.com'
   on conflict (user_id, role) do nothing;
   ```

### Option 2: Using Grant Role Function

Create a helper function (one-time setup):

```sql
create or replace function public.grant_admin_role(p_email text)
returns void
language plpgsql
security definer
as $$
declare
  v_uid uuid;
begin
  select id into v_uid from auth.users where email = p_email;
  if v_uid is null then
    raise exception 'User not found: %', p_email;
  end if;

  insert into public.user_roles (user_id, role)
  values (v_uid, 'admin')
  on conflict (user_id, role) do nothing;

  raise notice 'Admin role granted to %', p_email;
end;
$$;
```

Then use it:

```sql
select public.grant_admin_role('Damien@clearskairoofing.com');
```

## Environment Variables Configured

The following secrets are now set in your Lovable Cloud environment:

- `EMAIL_HOST`: smtp.office365.com
- `EMAIL_PORT`: 587
- `EMAIL_USER`: Damien@clearskairoofing.com
- `EMAIL_PASS`: (your mailbox password)

## Testing the Setup

### 1. Test Admin Sign-In

1. Make sure you've granted yourself admin access (see above)
2. Navigate to `/admin/signin`
3. Sign in with: `Damien@clearskairoofing.com`
4. Should redirect to `/dashboard` after successful authentication

### 2. Test Admin-Only Access

Wrap any component with `<AdminOnly>`:

```tsx
import AdminOnly from "@/components/AdminOnly";

function AdminDashboard() {
  return (
    <AdminOnly>
      <div>
        <h1>Admin Dashboard</h1>
        <p>Only admins can see this</p>
      </div>
    </AdminOnly>
  );
}
```

### 3. Test Email Sending

Call the edge function from your app:

```tsx
const {
  data: { session },
} = await supabase.auth.getSession();

await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  },
  body: JSON.stringify({
    to: "client@example.com",
    subject: "Your ClearSKai Report",
    html: "<p>Your report is ready!</p>",
  }),
});
```

## Security Notes

### Role-Based Access Control (RBAC)

- Roles are stored in the `user_roles` table (separate from user profiles)
- Uses security definer functions to prevent RLS recursion
- Checks both `admin` and `owner` roles for admin access

### Email Security

- All email credentials stored as Lovable Cloud secrets (encrypted)
- Edge function uses TLS/STARTTLS for secure SMTP connection
- Never exposes credentials to client-side code

### Admin Authentication Flow

1. User signs in at `/admin/signin`
2. Validates credentials via Supabase Auth
3. Checks `user_roles` table for admin/owner role
4. Signs out immediately if not an admin
5. Redirects to dashboard if authorized

## Available Roles

From `app_role` enum in your database:

- `owner`: Full access (first user, or manually granted)
- `admin`: Administrative access
- `moderator`: Future use
- `viewer`: Read-only access (default for new users)

## Troubleshooting

### "Access Denied" after sign-in

- Check if your user has the admin role:
  ```sql
  select * from public.user_roles where user_id = (
    select id from auth.users where email = 'your@email.com'
  );
  ```

### Email not sending

- Verify secrets are set correctly in Lovable Cloud
- Check edge function logs in your backend
- Ensure Microsoft 365 account allows SMTP connections
- Try testing SMTP credentials with a standalone tool first

### Can't access admin routes

- Make sure you're signed in
- Verify the route is public (not wrapped in `<ProtectedRoute>`)
- Check browser console for errors

## DNS Configuration for Email

For best email deliverability, configure these DNS records:

### SPF Record

```
TXT @ v=spf1 include:spf.protection.outlook.com -all
```

### DMARC Record

```
TXT _dmarc v=DMARC1; p=quarantine; rua=mailto:postmaster@clearskairoofing.com
```

These ensure Microsoft 365 can send email on behalf of your domain.

## Next Steps

1. **Grant yourself admin access** using SQL commands above
2. **Test sign-in** at `/admin/signin`
3. **Add admin-only features** using the `<AdminOnly>` wrapper
4. **Test email sending** from signature flow or other features
5. **Configure DNS records** for email deliverability

## Example: Protecting Admin Routes

```tsx
// In App.tsx, add admin routes
import AdminOnly from "./components/AdminOnly";
import AdminDashboard from "./pages/AdminDashboard";

// Inside Routes
<Route
  path="/admin/dashboard"
  element={
    <AdminOnly>
      <AdminDashboard />
    </AdminOnly>
  }
/>;
```
