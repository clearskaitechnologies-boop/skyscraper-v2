-- Create org_defaults table for storing organization-level preferences
create table if not exists public.org_defaults (
  org_id uuid primary key references public.orgs(id) on delete cascade,
  default_mode text not null check (default_mode in ('retail','insurance','inspection')) default 'inspection',
  default_photo_layout int not null check (default_photo_layout in (2,3,4)) default 3,
  auto_detect boolean not null default true,
  auto_pipeline_on_export boolean not null default true,
  from_name text,
  from_email text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.org_defaults enable row level security;

-- Policy: Users can read/write their org's defaults
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