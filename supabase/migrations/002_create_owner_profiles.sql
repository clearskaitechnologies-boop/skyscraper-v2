-- create owner_profiles
create table if not exists owner_profiles (
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

alter table if exists owner_profiles
  enable row level security;
