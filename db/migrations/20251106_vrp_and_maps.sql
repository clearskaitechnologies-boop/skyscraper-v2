-- Crews table
create table if not exists crews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text,
  depot_lat double precision,
  depot_lng double precision,
  phone text,
  notes text
);

-- Day plans
create table if not exists day_plans (
  id uuid primary key default gen_random_uuid(),
  crew_id uuid references crews(id),
  date date not null,
  created_by uuid,
  org_id uuid,
  created_at timestamptz default now()
);

create table if not exists day_plan_stops (
  id uuid primary key default gen_random_uuid(),
  day_plan_id uuid references day_plans(id),
  stop_type text not null, -- 'lead' or 'job'
  stop_id uuid not null,
  stop_order int not null,
  window_start timestamptz,
  window_end timestamptz,
  status text default 'pending', -- 'pending', 'completed'
  completed_at timestamptz,
  notes text
);

-- Leads
alter table leads
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists map_snapshot_url text,
  add column if not exists window_start timestamptz,
  add column if not exists window_end timestamptz,
  add column if not exists crew_id uuid references crews(id);

-- Jobs
alter table jobs
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists map_snapshot_url text,
  add column if not exists window_start timestamptz,
  add column if not exists window_end timestamptz,
  add column if not exists crew_id uuid references crews(id),
  add column if not exists status text default 'active',
  add column if not exists completed_at timestamptz;
