-- Phase 1 core: plans, token packs, tokens ledger, monthly usage, connections

create table if not exists plans (
  id text primary key,
  slug text unique not null,
  name text not null,
  price_cents int not null,
  posts_limit int not null,
  outreach_limit int not null,
  seats int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists token_packs (
  id text primary key,
  name text not null,
  tokens int not null,
  price_cents int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tokens_ledger (
  id text primary key,
  org_id uuid not null,
  delta int not null,
  reason text not null,
  ref_id text,
  balance_after int not null,
  created_at timestamptz default now()
);
create index if not exists tokens_ledger_org_created_idx on tokens_ledger(org_id, created_at);

create table if not exists network_usage_monthly (
  id text primary key,
  org_id uuid not null,
  year_month char(7) not null, -- YYYY-MM
  posts_used int not null default 0,
  outreach_used int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (org_id, year_month)
);

do $$ begin
  create type connection_status as enum ('pending','confirmed','blocked');
exception when duplicate_object then null; end $$;

create table if not exists org_connections (
  id text primary key,
  org_a uuid not null,
  org_b uuid not null,
  status connection_status not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (org_a, org_b)
);

create table if not exists org_plan (
  org_id uuid primary key,
  plan_id text not null,
  since timestamptz default now(),
  renews_on timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
