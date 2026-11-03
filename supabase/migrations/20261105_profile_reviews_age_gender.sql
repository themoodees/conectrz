-- Profile upgrades: reviews, birth date (shown as age), gender, more languages.

-- 1) More languages (admins can still rename or switch them off).
insert into public.languages (name)
select v.name
from (values ('Arabic'), ('Cantonese'), ('Dutch'), ('Hindi'), ('Indonesian'),
             ('Italian'), ('Polish'), ('Russian'), ('Tagalog'), ('Turkish')) as v(name)
where not exists (select 1 from public.languages l where l.name = v.name);

-- 2) Birth date and gender. Both are optional and live on the base table, which companies
--    cannot read. They only see gender and a computed age through creator_directory.
alter table public.creator_profiles
  add column if not exists birth_date date,
  add column if not exists gender text check (gender in ('woman', 'man', 'other'));

-- 3) Reviews: one per company per creator, only from companies that have a conversation.
create table if not exists public.creator_reviews (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references public.creator_profiles(id) on delete cascade,
  company_id  uuid not null references public.company_profiles(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text check (comment is null or char_length(comment) <= 1000),
  is_hidden   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (creator_id, company_id)
);
create index if not exists creator_reviews_creator_idx on public.creator_reviews (creator_id);

alter table public.creator_reviews enable row level security;

create policy "company reads own reviews" on public.creator_reviews
  for select using (company_id = (select auth.uid()) or public.is_admin());

create policy "company reviews creators it talked to" on public.creator_reviews
  for insert with check (
    company_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.company_id = (select auth.uid()) and c.creator_id = creator_reviews.creator_id
    )
  );

create policy "company edits own review" on public.creator_reviews
  for update using (company_id = (select auth.uid()) or public.is_admin())
  with check (company_id = (select auth.uid()) or public.is_admin());

create policy "company deletes own review" on public.creator_reviews
  for delete using (company_id = (select auth.uid()) or public.is_admin());

-- Only admins can hide a review; nobody can move a review to another creator or company.
create or replace function public.protect_review_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_hidden is distinct from old.is_hidden and not public.is_admin() then
    raise exception 'Only admins can hide a review';
  end if;
  if new.creator_id <> old.creator_id or new.company_id <> old.company_id then
    raise exception 'A review cannot be moved';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger creator_reviews_protect before update on public.creator_reviews
  for each row execute function public.protect_review_fields();

-- What people see: visible reviews with the company name. Companies, admins and the creator
-- being reviewed can read them; nobody else.
create or replace view public.creator_reviews_public as
select r.id,
       r.creator_id,
       r.rating,
       r.comment,
       r.created_at,
       r.updated_at,
       cp.name as company_name,
       (r.company_id = (select auth.uid())) as is_mine
from public.creator_reviews r
join public.company_profiles cp on cp.id = r.company_id
where not r.is_hidden
  and (
    r.creator_id = (select auth.uid())
    or public.is_admin()
    or (exists (select 1 from public.profiles p
                where p.id = (select auth.uid()) and p.role = 'company')
        and public.creator_is_published(r.creator_id))
  );
revoke all on public.creator_reviews_public from anon, public;
grant select on public.creator_reviews_public to authenticated;

-- 4) The company-facing directory gains gender, age and rating (columns appended at the end).
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
       (select round(avg(r.rating)::numeric, 1)
          from public.creator_reviews r
         where r.creator_id = cp.id and not r.is_hidden) as rating_avg,
       (select count(*)::int
          from public.creator_reviews r
         where r.creator_id = cp.id and not r.is_hidden) as review_count
from public.creator_profiles cp
where public.creator_is_published(cp.id)
  and (public.is_admin()
       or exists (select 1 from public.profiles p
                  where p.id = (select auth.uid()) and p.role = 'company'));

-- 5) Self-service deletion also erases birth date and gender.
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
         is_available = false, status = 'deleted', updated_at = now()
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
