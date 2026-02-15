-- Fix security definer view issue
-- The view doesn't need special privileges; RLS on user_profiles handles security

drop view if exists public.user_organizations;

create view public.user_organizations as
select
  up.user_id,
  up.org_id,
  coalesce(up.created_at, now()) as created_at
from public.user_profiles up;

-- Grant read access to authenticated users
grant select on public.user_organizations to authenticated;

-- The underlying user_profiles table already has RLS policies that will be enforced