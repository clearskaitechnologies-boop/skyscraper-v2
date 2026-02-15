-- =====================================================
-- MASTER ONBOARDING SETUP
-- Ensures org/branding/tokens are properly constrained
-- and provides UPSERT function for idempotent operations
-- =====================================================

-- 1) Ensure primary keys and uniqueness constraints
alter table public.orgs
  add column if not exists id text,
  add primary key if not exists (id);

alter table public.org_branding
  add column if not exists id text,
  add column if not exists "orgId" text not null,
  add column if not exists "ownerId" text not null;

-- Add primary key if not exists (requires conditional logic)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'org_branding_pkey'
  ) then
    alter table public.org_branding add primary key (id);
  end if;
end $$;

-- Create unique index on orgId (idempotent)
create unique index if not exists org_branding_orgid_uidx 
  on public.org_branding("orgId");

-- 2) UPSERT function for branding (prevents duplicates, safe defaults)
create or replace function public.upsert_org_branding(
  p_org_id text,
  p_owner_id text,
  p_company_name text,
  p_license text,
  p_phone text,
  p_email text,
  p_website text,
  p_color_primary text default '#117CFF',
  p_color_accent  text default '#FFC838',
  p_logo_url text default null,
  p_team_photo_url text default null
) returns void language plpgsql as $$
begin
  insert into public.org_branding(
    id, "orgId", "ownerId", "companyName", license, phone, email, website,
    "colorPrimary", "colorAccent", "logoUrl", "teamPhotoUrl",
    "createdAt", "updatedAt"
  ) values (
    p_org_id, 
    p_org_id, 
    p_owner_id, 
    coalesce(nullif(p_company_name,''), 'Your Roofing Company LLC'),
    p_license, 
    p_phone, 
    p_email, 
    p_website,
    coalesce(nullif(p_color_primary,''),'#117CFF'),
    coalesce(nullif(p_color_accent,''), '#FFC838'),
    p_logo_url, 
    p_team_photo_url,
    now(),
    now()
  )
  on conflict ("orgId") do update set
    "companyName"  = coalesce(nullif(excluded."companyName",''), org_branding."companyName"),
    license        = coalesce(excluded.license, org_branding.license),
    phone          = coalesce(excluded.phone, org_branding.phone),
    email          = coalesce(excluded.email, org_branding.email),
    website        = coalesce(excluded.website, org_branding.website),
    "colorPrimary" = coalesce(nullif(excluded."colorPrimary",''), org_branding."colorPrimary"),
    "colorAccent"  = coalesce(nullif(excluded."colorAccent",''), org_branding."colorAccent"),
    "logoUrl"      = coalesce(excluded."logoUrl", org_branding."logoUrl"),
    "teamPhotoUrl" = coalesce(excluded."teamPhotoUrl", org_branding."teamPhotoUrl"),
    "updatedAt"    = now();
end $$;

-- 3) Create usage_tokens table for tracking AI/DOL/report credits
create table if not exists public.usage_tokens(
  id uuid default gen_random_uuid() primary key,
  "orgId" text not null,
  kind text not null,           -- e.g. 'ai','dols','reports'
  balance int not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique("orgId","kind")
);

-- Add indexes for performance
create index if not exists usage_tokens_orgid_idx on public.usage_tokens("orgId");
create index if not exists usage_tokens_kind_idx on public.usage_tokens(kind);

-- 4) Add comments for documentation
comment on function public.upsert_org_branding is 
  'Idempotent UPSERT for org_branding. Creates or updates branding with safe defaults. Prevents duplicates via CONFLICT on orgId.';

comment on table public.usage_tokens is 
  'Tracks usage-based tokens per org. Each org gets starter tokens on onboarding (ai, dols, reports).';
