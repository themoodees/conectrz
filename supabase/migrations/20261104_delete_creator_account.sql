-- Self-service account deletion for creators ("anonymise, keep history").
-- The profile row, conversations, messages, applications and reports stay so companies keep
-- their history and moderation evidence; every personal detail is removed and the login is closed.
create or replace function public.delete_my_creator_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;
  if not exists (select 1 from public.profiles where id = uid and role = 'creator') then
    raise exception 'Only creator accounts can be deleted here';
  end if;

  delete from public.creator_languages where creator_id = uid;
  delete from public.creator_niches    where creator_id = uid;
  delete from public.creator_services  where creator_id = uid;
  delete from public.social_accounts   where creator_id = uid;
  delete from public.portfolio_items   where creator_id = uid;
  delete from public.saved_creators    where creator_id = uid;
  delete from public.notifications     where user_id = uid;

  update public.project_applications
     set status = 'withdrawn', updated_at = now()
   where creator_id = uid and status = 'submitted';

  update public.creator_profiles
     set first_name = 'Deleted', last_name = 'creator', photo_url = null, bio = null,
         prefecture = null, city = null, is_available = false,
         status = 'deleted', updated_at = now()
   where id = uid;

  -- Close the login and free the email address for a future sign-up.
  delete from auth.identities where user_id = uid;
  delete from auth.sessions   where user_id = uid;
  update auth.users
     set email = 'deleted-' || uid || '@deleted.invalid',
         encrypted_password = null,
         raw_user_meta_data = '{}'::jsonb,
         raw_app_meta_data = '{}'::jsonb,
         banned_until = 'infinity'
   where id = uid;
end;
$$;

revoke all on function public.delete_my_creator_account() from public, anon;
grant execute on function public.delete_my_creator_account() to authenticated;
