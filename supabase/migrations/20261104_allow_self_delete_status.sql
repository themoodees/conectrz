-- delete_my_creator_account() is a SECURITY DEFINER function owned by postgres and needs to set
-- the creator's status to 'deleted'. Let trusted database roles through this guard; signed-in
-- users (role "authenticated") still can't change their own status.
create or replace function public.protect_account_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status
     and not public.is_admin()
     and current_user not in ('postgres', 'supabase_admin') then
    raise exception 'Only admins can change account status';
  end if;
  return new;
end;
$$;
