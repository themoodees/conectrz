-- Creators who confirmed their email and have not received the profile reminder yet, with what their
-- profile is missing. Used only by the send-profile-reminder edge function (service role).
create or replace function public.profile_reminder_candidates()
returns table (
  user_id uuid,
  email text,
  preferred_language text,
  has_profile boolean,
  status text,
  first_name text,
  has_prefecture boolean,
  has_language boolean,
  has_service boolean
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    u.id,
    u.email::text,
    p.preferred_language::text,
    c.id is not null,
    c.status::text,
    c.first_name,
    coalesce(c.prefecture is not null, false),
    exists (select 1 from public.creator_languages l where l.creator_id = c.id),
    exists (select 1 from public.creator_services s where s.creator_id = c.id)
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.creator_profiles c on c.id = u.id
  where u.raw_user_meta_data ->> 'role' = 'creator'
    and u.email_confirmed_at is not null
    and u.email is not null
    and not exists (select 1 from public.profile_reminders r where r.user_id = u.id);
$$;

revoke all on function public.profile_reminder_candidates() from public, anon, authenticated;
grant execute on function public.profile_reminder_candidates() to service_role;
