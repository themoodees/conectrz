-- Payment methods. Conectrz does not handle payments: companies say how they will pay on each
-- project, creators say which methods they accept, and each side can see the other's list.
alter table public.projects
  add column if not exists payment_methods text[] not null default '{}'
  check (payment_methods <@ array['bank_transfer','paypal','wise','stripe','other']::text[]);

alter table public.creator_profiles
  add column if not exists payment_methods text[] not null default '{}'
  check (payment_methods <@ array['bank_transfer','paypal','wise','stripe','other']::text[]);

create or replace view public.project_listings as
select pr.id,
       pr.title,
       pr.description,
       pr.budget_usd_cents,
       pr.delivery_deadline,
       pr.status,
       pr.created_at,
       pr.updated_at,
       co.name as company_name,
       coalesce((select array_agg(ps.service_id) from public.project_services ps where ps.project_id = pr.id), '{}'::uuid[]) as service_ids,
       coalesce((select array_agg(pn.niche_id) from public.project_niches pn where pn.project_id = pr.id), '{}'::uuid[]) as niche_ids,
       coalesce((select array_agg(pl.language_id) from public.project_languages pl where pl.project_id = pr.id), '{}'::uuid[]) as language_ids,
       pr.payment_methods
from public.projects pr
join public.company_profiles co on co.id = pr.company_id
where public.is_admin()
   or ((exists (select 1 from public.creator_profiles cp
                where cp.id = (select auth.uid()) and cp.status = 'active'))
       and (pr.status = 'open'
            or exists (select 1 from public.project_applications a
                       where a.project_id = pr.id and a.creator_id = (select auth.uid()))));

create or replace view public.project_applicants as
select a.id,
       a.project_id,
       a.creator_id,
       a.message,
       a.proposed_amount_usd_cents,
       a.status,
       a.created_at,
       cp.first_name,
       case when public.has_paid_plan() then cp.last_name else null::text end as last_name,
       cp.photo_url,
       cp.status as creator_status,
       cp.payment_methods
from public.project_applications a
join public.projects pr on pr.id = a.project_id
join public.creator_profiles cp on cp.id = a.creator_id
where pr.company_id = (select auth.uid()) or public.is_admin();

create or replace view public.creator_directory as
select cp.id,
       cp.first_name,
       case when public.has_paid_plan() then cp.last_name else null::text end as last_name,
       cp.photo_url,
       cp.bio,
       cp.country,
       cp.prefecture,
       cp.is_available,
       case when public.has_paid_plan() then cp.city else null::text end as city,
       cp.gender,
       case when cp.birth_date is not null
            then extract(year from age(current_date, cp.birth_date))::int end as age,
       (select round(avg(r.rating)::numeric, 1) from public.creator_reviews r
         where r.creator_id = cp.id and not r.is_hidden) as rating_avg,
       (select count(*)::int from public.creator_reviews r
         where r.creator_id = cp.id and not r.is_hidden) as review_count,
       cp.payment_methods
from public.creator_profiles cp
where public.creator_is_published(cp.id)
  and (public.is_admin()
       or exists (select 1 from public.profiles p
                  where p.id = (select auth.uid()) and p.role = 'company'));

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
         prefecture = null, city = null, birth_date = null, gender = null,
         payment_methods = '{}', is_available = false, status = 'deleted', updated_at = now()
   where id = uid;

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
