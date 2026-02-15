-- Update trigger to also set owner_id for backward compatibility
create or replace function public.after_org_insert_grant_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Set owner_id if not already set
  if new.owner_id is null then
    update public.orgs set owner_id = auth.uid() where id = new.id;
  end if;

  -- link user to org
  insert into public.user_profiles (user_id, org_id)
  values (auth.uid(), new.id)
  on conflict (user_id) do update set org_id = excluded.org_id;

  -- ensure owner role
  insert into public.user_roles (user_id, role)
  values (auth.uid(), 'owner'::app_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;