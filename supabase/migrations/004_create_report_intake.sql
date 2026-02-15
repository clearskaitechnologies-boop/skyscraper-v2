-- create report_intake snapshot table
create table if not exists report_intake (
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

alter table if exists report_intake
  enable row level security;
