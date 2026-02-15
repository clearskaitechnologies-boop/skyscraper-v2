-- create insurance_defaults
create table if not exists insurance_defaults (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  carrier_name text,
  policy_type text check (policy_type in ('ACV','RCV','Other')),
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists insurance_defaults
  enable row level security;
