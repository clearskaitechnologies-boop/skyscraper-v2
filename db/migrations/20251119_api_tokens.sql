create table if not exists app.api_tokens (
  id uuid primary key default gen_random_uuid(),
  org_id text references "Org"(id) on delete cascade,
  token_hash text not null unique,
  scopes text[] not null default '{}',
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
comment on table app.api_tokens is 'Scoped API access tokens';
