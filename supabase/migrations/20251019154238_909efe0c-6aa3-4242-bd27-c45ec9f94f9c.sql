-- 1) Ensure orgs + user_profiles exist (lightweight, safe)
do $$
begin
  if to_regclass('public.orgs') is null then
    create type plan_tier as enum ('free','pro','plus','enterprise');
    create table public.orgs (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      plan plan_tier not null default 'free',
      owner_id uuid references auth.users(id) on delete set null,
      website text,
      phone text,
      email text,
      address text,
      city text,
      state text,
      zip text,
      created_at timestamptz default now()
    );
  end if;

  if to_regclass('public.user_profiles') is null then
    create table public.user_profiles (
      user_id uuid primary key references auth.users(id) on delete cascade,
      org_id uuid references public.orgs(id) on delete set null,
      display_name text,
      created_at timestamptz default now()
    );
  end if;
end$$;

-- Add missing columns to orgs if table already exists
alter table public.orgs add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.orgs add column if not exists website text;
alter table public.orgs add column if not exists phone text;
alter table public.orgs add column if not exists email text;
alter table public.orgs add column if not exists address text;
alter table public.orgs add column if not exists city text;
alter table public.orgs add column if not exists state text;
alter table public.orgs add column if not exists zip text;

-- 2) Ensure org_branding exists WITH all columns including website
create table if not exists public.org_branding (
  org_id uuid primary key references public.orgs(id) on delete cascade,
  company_name text,
  logo_url text,
  phone text,
  email text,
  website text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text default 'US',
  report_cover_style text default 'modern',
  photo_layout text default '3',
  claims_layout text default 'standard',
  theme_primary text default '#0ea5e9',
  theme_secondary text default '#111827',
  theme_accent text default '#22c55e',
  updated_at timestamptz default now()
);

-- Add any missing columns idempotently
alter table public.org_branding add column if not exists company_name text;
alter table public.org_branding add column if not exists logo_url text;
alter table public.org_branding add column if not exists phone text;
alter table public.org_branding add column if not exists email text;
alter table public.org_branding add column if not exists website text;
alter table public.org_branding add column if not exists address_line1 text;
alter table public.org_branding add column if not exists address_line2 text;
alter table public.org_branding add column if not exists city text;
alter table public.org_branding add column if not exists state text;
alter table public.org_branding add column if not exists postal_code text;
alter table public.org_branding add column if not exists country text default 'US';
alter table public.org_branding add column if not exists report_cover_style text default 'modern';
alter table public.org_branding add column if not exists photo_layout text default '3';
alter table public.org_branding add column if not exists claims_layout text default 'standard';
alter table public.org_branding add column if not exists theme_primary text default '#0ea5e9';
alter table public.org_branding add column if not exists theme_secondary text default '#111827';
alter table public.org_branding add column if not exists theme_accent text default '#22c55e';
alter table public.org_branding add column if not exists updated_at timestamptz default now();

-- RLS for user_profiles
alter table public.user_profiles enable row level security;

drop policy if exists user_profiles_rw on public.user_profiles;
create policy user_profiles_rw on public.user_profiles
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Seed user_profiles for existing users
insert into public.user_profiles(user_id)
select u.id from auth.users u
left join public.user_profiles up on up.user_id = u.id
where up.user_id is null;

-- RLS for org_branding
alter table public.org_branding enable row level security;

drop policy if exists org_branding_rw on public.org_branding;
create policy org_branding_rw on public.org_branding
for all to authenticated
using (
  exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid()
      and up.org_id = org_branding.org_id
  )
)
with check (
  exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid()
      and up.org_id = org_branding.org_id
  )
);

-- RLS for orgs
alter table public.orgs enable row level security;

drop policy if exists orgs_owner_rw on public.orgs;
create policy orgs_owner_rw on public.orgs
for all to authenticated
using (owner_id = auth.uid() or exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and up.org_id = orgs.id))
with check (owner_id = auth.uid() or exists (select 1 from public.user_profiles up where up.user_id = auth.uid() and up.org_id = orgs.id));

-- Trigger to set owner on insert
create or replace function public.orgs_set_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end $$;

drop trigger if exists trg_orgs_set_owner on public.orgs;
create trigger trg_orgs_set_owner
before insert on public.orgs
for each row execute function public.orgs_set_owner();

-- 3) Helper function + RPC that wizard calls
drop function if exists public.ensure_current_org();
create or replace function public.ensure_current_org()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_org uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select up.org_id into v_org
  from public.user_profiles up
  where up.user_id = v_uid
  limit 1;

  if v_org is null then
    insert into public.orgs (name) values ('New Company')
      returning id into v_org;

    insert into public.user_profiles (user_id, org_id)
    values (v_uid, v_org)
    on conflict (user_id) do update set org_id = excluded.org_id;
  end if;

  return v_org;
end
$$;

revoke all on function public.ensure_current_org() from public;
grant execute on function public.ensure_current_org() to authenticated;

drop function if exists public.upsert_org_branding(jsonb);
create or replace function public.upsert_org_branding(_b jsonb)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.ensure_current_org();
begin
  insert into public.org_branding(
    org_id, company_name, logo_url, phone, email, website,
    address_line1, address_line2, city, state, postal_code, country,
    report_cover_style, photo_layout, claims_layout,
    theme_primary, theme_secondary, theme_accent, updated_at
  )
  values(
    v_org,
    _b->>'company_name', _b->>'logo_url', _b->>'phone', _b->>'email', _b->>'website',
    _b->>'address_line1', _b->>'address_line2', _b->>'city', _b->>'state', _b->>'postal_code', coalesce(_b->>'country','US'),
    coalesce(_b->>'report_cover_style','modern'),
    coalesce(_b->>'photo_layout','3'),
    coalesce(_b->>'claims_layout','standard'),
    coalesce(_b->>'theme_primary','#0ea5e9'),
    coalesce(_b->>'theme_secondary','#111827'),
    coalesce(_b->>'theme_accent','#22c55e'),
    now()
  )
  on conflict (org_id) do update set
    company_name       = excluded.company_name,
    logo_url           = excluded.logo_url,
    phone              = excluded.phone,
    email              = excluded.email,
    website            = excluded.website,
    address_line1      = excluded.address_line1,
    address_line2      = excluded.address_line2,
    city               = excluded.city,
    state              = excluded.state,
    postal_code        = excluded.postal_code,
    country            = excluded.country,
    report_cover_style = excluded.report_cover_style,
    photo_layout       = excluded.photo_layout,
    claims_layout      = excluded.claims_layout,
    theme_primary      = excluded.theme_primary,
    theme_secondary    = excluded.theme_secondary,
    theme_accent       = excluded.theme_accent,
    updated_at         = now();

  return json_build_object('ok', true, 'org_id', v_org);
end
$$;

revoke all on function public.upsert_org_branding(jsonb) from public;
grant execute on function public.upsert_org_branding(jsonb) to authenticated;