-- Creators who live outside Japan (Japanese creators abroad) can have a published profile.
-- `country_code` is the ISO 3166-1 alpha-2 code ('JP' for everyone so far). A Japan-based creator
-- still needs a prefecture to be published; a creator abroad does not (they give a city instead).

alter table public.creator_profiles
  add column if not exists country_code text not null default 'JP' check (country_code ~ '^[A-Z]{2}$');

create or replace function public.creator_is_published(p_creator_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select exists (
    select 1 from public.creator_profiles cp
    where cp.id = p_creator_id
      and cp.status = 'active'
      and (cp.country_code <> 'JP' or cp.prefecture is not null)
      and exists (select 1 from public.creator_languages cl where cl.creator_id = cp.id)
      and exists (select 1 from public.creator_services cs where cs.creator_id = cp.id)
  );
$function$;

-- Same view as before, plus country_code (added last so existing columns keep their positions).
create or replace view public.creator_directory as
 SELECT id,
    first_name,
        CASE
            WHEN public.has_paid_plan() THEN last_name
            ELSE NULL::text
        END AS last_name,
    photo_url,
    bio,
    country,
    prefecture,
    is_available,
        CASE
            WHEN public.has_paid_plan() THEN city
            ELSE NULL::text
        END AS city,
    gender,
        CASE
            WHEN birth_date IS NOT NULL THEN EXTRACT(year FROM age(CURRENT_DATE::timestamp with time zone, birth_date::timestamp with time zone))::integer
            ELSE NULL::integer
        END AS age,
    ( SELECT round(avg(r.rating), 1) AS round
           FROM public.creator_reviews r
          WHERE r.creator_id = cp.id AND NOT r.is_hidden) AS rating_avg,
    ( SELECT count(*)::integer AS count
           FROM public.creator_reviews r
          WHERE r.creator_id = cp.id AND NOT r.is_hidden) AS review_count,
    payment_methods,
        CASE
            WHEN public.has_paid_plan() THEN city_code
            ELSE NULL::text
        END AS city_code,
    country_code
   FROM public.creator_profiles cp
  WHERE public.creator_is_published(id) AND (public.is_admin() OR (EXISTS ( SELECT 1
           FROM public.profiles p
          WHERE p.id = (( SELECT auth.uid() AS uid)) AND p.role = 'company'::public.user_role)));

-- The profile reminder only asks for a prefecture from creators living in Japan.
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
    coalesce(c.prefecture is not null or c.country_code <> 'JP', false),
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

notify pgrst, 'reload schema';
