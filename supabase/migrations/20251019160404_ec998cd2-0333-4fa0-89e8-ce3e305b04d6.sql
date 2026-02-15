-- Ensure bucket exists
insert into storage.buckets (id, name, public)
values ('branding','branding', true)
on conflict (id) do nothing;

-- Drop old policies if they exist
drop policy if exists branding_public_read on storage.objects;
drop policy if exists branding_member_write on storage.objects;
drop policy if exists branding_member_update_delete on storage.objects;
drop policy if exists branding_member_list on storage.objects;

-- Public READ (logos can be read by anyone)
create policy branding_public_read
on storage.objects
for select
to public
using (bucket_id = 'branding');

-- Authenticated INSERT (only under their org folder: "<org_id>/...")
create policy branding_member_write
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'branding'
  and (
    exists (
      select 1
      from public.user_profiles up
      where up.user_id = auth.uid()
        and name LIKE up.org_id::text || '/%'
    )
    or exists (
      select 1
      from public.orgs o
      where o.owner_id = auth.uid()
        and name LIKE o.id::text || '/%'
    )
  )
);

-- Authenticated UPDATE/DELETE only within their org folder
create policy branding_member_update_delete
on storage.objects
for update
to authenticated
using (
  bucket_id = 'branding'
  and (
    exists (
      select 1
      from public.user_profiles up
      where up.user_id = auth.uid()
        and name LIKE up.org_id::text || '/%'
    )
    or exists (
      select 1
      from public.orgs o
      where o.owner_id = auth.uid()
        and name LIKE o.id::text || '/%'
    )
  )
);

-- Optional: limit SELECT listing to own org folder for authenticated users
create policy branding_member_list
on storage.objects
for select
to authenticated
using (
  bucket_id = 'branding'
  and (
    exists (
      select 1
      from public.user_profiles up
      where up.user_id = auth.uid()
        and name LIKE up.org_id::text || '/%'
    )
    or exists (
      select 1
      from public.orgs o
      where o.owner_id = auth.uid()
        and name LIKE o.id::text || '/%'
    )
  )
);