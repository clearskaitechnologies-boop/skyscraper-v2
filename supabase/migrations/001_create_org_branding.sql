-- create org_branding
create table if not exists org_branding (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  logo_url text,
  roc_number text,
  service_area_presets text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists org_branding
  enable row level security;
