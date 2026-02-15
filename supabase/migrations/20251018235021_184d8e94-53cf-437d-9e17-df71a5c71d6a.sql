-- SAFETY
set check_function_bodies = off;

-- (A) Add org tracking columns
alter table public.orgs
  add column if not exists created_by uuid references auth.users(id);

alter table public.leads
  add column if not exists org_id uuid references public.orgs(id);

alter table public.reports
  add column if not exists org_id uuid references public.orgs(id);

-- (B) user_profiles RLS (user can manage their own profile link)
alter table public.user_profiles enable row level security;

drop policy if exists up_rw on public.user_profiles;
drop policy if exists user_profiles_self on public.user_profiles;

create policy up_rw on public.user_profiles
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- (C) orgs RLS
alter table public.orgs enable row level security;

drop policy if exists orgs_select on public.orgs;
drop policy if exists org_owner_all on public.orgs;

create policy orgs_select on public.orgs
  for select to authenticated
  using (
    exists (select 1 from public.user_profiles up
            where up.user_id = auth.uid() and up.org_id = orgs.id)
    or created_by = auth.uid()
  );

create policy orgs_insert_initial on public.orgs
  for insert to authenticated
  with check (created_by = auth.uid());

create policy orgs_update_own on public.orgs
  for update to authenticated
  using (
    exists (select 1 from public.user_profiles up
            where up.user_id = auth.uid() and up.org_id = orgs.id)
  );

-- (D) org_branding RLS
alter table public.org_branding enable row level security;

drop policy if exists org_branding_rw on public.org_branding;
drop policy if exists org_branding_owner_all on public.org_branding;

create policy org_branding_rw on public.org_branding
  for all to authenticated
  using (
    exists (select 1 from public.user_profiles up
            where up.user_id = auth.uid() and up.org_id = org_branding.org_id)
  )
  with check (
    exists (select 1 from public.user_profiles up
            where up.user_id = auth.uid() and up.org_id = org_branding.org_id)
  );

-- (E) org_defaults RLS
alter table public.org_defaults enable row level security;

drop policy if exists org_defaults_rw on public.org_defaults;

create policy org_defaults_rw on public.org_defaults
  for all to authenticated
  using (
    exists (select 1 from public.user_profiles up
            where up.user_id = auth.uid() and up.org_id = org_defaults.org_id)
  )
  with check (
    exists (select 1 from public.user_profiles up
            where up.user_id = auth.uid() and up.org_id = org_defaults.org_id)
  );

-- (F) leads RLS - update existing policies
drop policy if exists "Owners and admins can view all leads" on public.leads;
drop policy if exists "Users can create their own leads" on public.leads;
drop policy if exists "Users can update their own leads" on public.leads;
drop policy if exists "Users can view their own leads" on public.leads;
drop policy if exists leads_rw on public.leads;

create policy leads_select on public.leads
  for select to authenticated
  using (
    user_id = auth.uid() or
    (org_id is not null and exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.org_id = leads.org_id
    ))
  );

create policy leads_insert on public.leads
  for insert to authenticated
  with check (
    user_id = auth.uid() and
    (org_id is null or exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.org_id = leads.org_id
    ))
  );

create policy leads_update on public.leads
  for update to authenticated
  using (
    user_id = auth.uid() or
    (org_id is not null and exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.org_id = leads.org_id
    ))
  );

-- (G) reports RLS - update existing policies
drop policy if exists "Users can create reports" on public.reports;
drop policy if exists "Users can update their reports" on public.reports;
drop policy if exists "Users can view reports for their leads" on public.reports;
drop policy if exists reports_rw on public.reports;

create policy reports_select on public.reports
  for select to authenticated
  using (
    created_by = auth.uid() or
    (org_id is not null and exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.org_id = reports.org_id
    ))
  );

create policy reports_insert on public.reports
  for insert to authenticated
  with check (
    created_by = auth.uid() and
    (org_id is null or exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.org_id = reports.org_id
    ))
  );

create policy reports_update on public.reports
  for update to authenticated
  using (
    created_by = auth.uid() or
    (org_id is not null and exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.org_id = reports.org_id
    ))
  );

-- (H) trigger: auto-link creator to org & grant owner role
create or replace function public.after_org_insert_grant_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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