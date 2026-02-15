-- Auto-assign owner role to first user
create or replace function public.after_signup_owner()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not exists (select 1 from public.user_roles) then
    insert into public.user_roles (user_id, role) values (new.id, 'owner');
  end if;
  return new;
end $$;

drop trigger if exists trg_after_signup_owner on auth.users;
create trigger trg_after_signup_owner
  after insert on auth.users
  for each row execute function public.after_signup_owner();