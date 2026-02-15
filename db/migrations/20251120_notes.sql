-- Migration: create notes table with sample data and public read RLS
-- Date: 2025-11-20

-- 1. Create table (id as identity, minimal schema)
create table if not exists public.notes (
  id bigint primary key generated always as identity,
  title text not null,
  inserted_at timestamptz not null default now()
);

-- 2. Seed sample rows (idempotent: only insert if table empty)
insert into public.notes (title)
select * from (
  values
    ('Today I created a Supabase project.'),
    ('I added some data and queried it from Next.js.'),
    ('It was awesome!')
) as v(title)
where not exists (select 1 from public.notes);

-- 3. Enable Row Level Security
alter table public.notes enable row level security;

-- 4. Public read-only policy for anon role
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'notes' and policyname = 'public read notes'
  ) then
    execute 'create policy "public read notes" on public.notes for select to anon using (true)';
  end if;
end
$$;

-- 5. (Optional) Future write policies can be added here
-- create policy "authenticated insert notes" on public.notes for insert to authenticated with check (true);
