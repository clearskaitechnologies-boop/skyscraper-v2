-- 001_fix_org_branding_and_create_rest.sql

-- A) Ensure org_branding exists with required columns
create table if not exists public.org_branding (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  logo_url text,
  roc_number text,
  service_area_presets text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add any missing columns safely
alter table public.org_branding
  add column if not exists logo_url text,
  add column if not exists roc_number text,
  add column if not exists service_area_presets text[] default '{}',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Optional: unique org row (1 branding row per org)
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'org_branding_org_id_unique'
  ) then
    create unique index org_branding_org_id_unique on public.org_branding(org_id);
  end if;
end$$;

-- B) Owner profiles
create table if not exists public.owner_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  label text not null,
  full_name text not null,
  email text,
  phone text,
  address1 text,
  address2 text,
  city text,
  state text,
  zip text,
  is_default boolean default false,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- C) Insurance defaults
create table if not exists public.insurance_defaults (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  carrier_name text,
  policy_type text check (policy_type in ('ACV','RCV','Other')),
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- D) Report intake snapshots
create table if not exists public.report_intake (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  report_number text,
  owner jsonb,
  insurance jsonb,
  licenses jsonb,
  service_area text,
  rep jsonb,
  meet_the_team jsonb,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- E) Usage metering
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  user_id uuid,
  kind text check (kind in ('DOL_PULL','AI_MOCKUP')),
  unit_cost_cents integer not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- F) RLS (enable and add simple org-scoped policies)
alter table public.org_branding enable row level security;
alter table public.owner_profiles enable row level security;
alter table public.insurance_defaults enable row level security;
alter table public.report_intake enable row level security;
alter table public.usage_events enable row level security;

-- Replace auth function/column below with your org resolution (e.g., auth.jwt() claim 'org_id')
create policy if not exists org_branding_isolation
  on public.org_branding
  using (org_id = current_setting('request.jwt.claims', true)::jsonb->>'org_id');

create policy if not exists owner_profiles_isolation
  on public.owner_profiles
  using (org_id = current_setting('request.jwt.claims', true)::jsonb->>'org_id');

create policy if not exists insurance_defaults_isolation
  on public.insurance_defaults
  using (org_id = current_setting('request.jwt.claims', true)::jsonb->>'org_id');

create policy if not exists report_intake_isolation
  on public.report_intake
  using (org_id = current_setting('request.jwt.claims', true)::jsonb->>'org_id');

create policy if not exists usage_events_isolation
  on public.usage_events
  using (org_id = current_setting('request.jwt.claims', true)::jsonb->>'org_id');
