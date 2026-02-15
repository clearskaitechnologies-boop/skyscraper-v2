-- Fix orgs RLS for creation
alter table public.orgs
  add column if not exists created_by uuid,
  alter column created_by set default auth.uid();

alter table public.orgs enable row level security;

-- Allow insert even if frontend omits created_by (defaults to auth.uid())
drop policy if exists orgs_insert_initial on public.orgs;
create policy orgs_insert_initial on public.orgs
for insert to authenticated
with check ( coalesce(created_by, auth.uid()) = auth.uid() );

-- Creator or members can SELECT the org
drop policy if exists orgs_select on public.orgs;
create policy orgs_select on public.orgs
for select to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid() and up.org_id = orgs.id
  )
);

-- Allow UPDATE for org members
drop policy if exists orgs_update_own on public.orgs;
create policy orgs_update_own on public.orgs
for update to authenticated
using (
  exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid() and up.org_id = orgs.id
  )
);

-- Auto-link creator to org and grant owner
create or replace function public.after_org_insert_grant_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Set owner_id if not already set
  if new.owner_id is null then
    update public.orgs set owner_id = auth.uid() where id = new.id;
  end if;

  -- link user to org
  insert into public.user_profiles (user_id, org_id)
  values (auth.uid(), new.id)
  on conflict (user_id) do update set org_id = excluded.org_id;

  -- ensure owner role
  insert into public.user_roles (user_id, role)
  values (auth.uid(), 'owner'::app_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_after_org_insert_grant_owner on public.orgs;
create trigger trg_after_org_insert_grant_owner
after insert on public.orgs
for each row execute function public.after_org_insert_grant_owner();