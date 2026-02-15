-- Fix reports RLS policy typo and add org_layouts table
set check_function_bodies = off;

-- Fix the reports RLS policy (typo: up_org_id → org_id)
drop policy if exists reports_rw on public.reports;
create policy reports_rw on public.reports
  for all to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.org_id = reports.org_id
    )
  )
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.org_id = reports.org_id
    )
  );

-- Create org_layouts table for persisting layout presets
create table if not exists public.org_layouts (
  org_id uuid primary key references public.orgs(id) on delete cascade,
  preset_id text not null default 'claims_standard',
  preset_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.org_layouts enable row level security;

drop policy if exists org_layouts_rw on public.org_layouts;
create policy org_layouts_rw on public.org_layouts
  for all to authenticated
  using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.org_id = org_layouts.org_id
    )
  )
  with check (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() and up.org_id = org_layouts.org_id
    )
  );