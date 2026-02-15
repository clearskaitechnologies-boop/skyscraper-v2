-- Feature flags table (org-scoped optional)
create table if not exists app.feature_flags (
  id uuid primary key default gen_random_uuid(),
  org_id text references "Org"(id) on delete cascade,
  key text not null unique,
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);
comment on table app.feature_flags is 'Runtime feature flags (org-scoped if org_id set, else global)';
