-- create usage_events
create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  user_id uuid,
  kind text check (kind in ('DOL_PULL','AI_MOCKUP')),
  unit_cost_cents integer not null,
  meta jsonb,
  created_at timestamptz default now()
);

alter table if exists usage_events
  enable row level security;
