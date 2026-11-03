-- Creators review brands (the mirror of creator_reviews).
-- One review per creator per company; only creators who have a conversation with that company.
-- Readable by creators, the company itself and admins.
create table public.company_reviews (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.company_profiles(id) on delete cascade,
  creator_id  uuid not null references public.creator_profiles(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text check (comment is null or char_length(comment) <= 1000),
  is_hidden   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (company_id, creator_id)
);
create index company_reviews_company_idx on public.company_reviews (company_id);

alter table public.company_reviews enable row level security;

create policy "creator reads own company reviews" on public.company_reviews
  for select using (creator_id = (select auth.uid()) or public.is_admin());

create policy "creator reviews companies it talked to" on public.company_reviews
  for insert with check (
    creator_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.creator_id = (select auth.uid()) and c.company_id = company_reviews.company_id
    )
  );

create policy "creator edits own company review" on public.company_reviews
  for update using (creator_id = (select auth.uid()) or public.is_admin())
  with check (creator_id = (select auth.uid()) or public.is_admin());

create policy "creator deletes own company review" on public.company_reviews
  for delete using (creator_id = (select auth.uid()) or public.is_admin());

create or replace function public.protect_company_review_fields()
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
create trigger company_reviews_protect before update on public.company_reviews
  for each row execute function public.protect_company_review_fields();

-- What people see: visible reviews with the reviewer's first name.
-- Creators, the reviewed company and admins can read them.
create or replace view public.company_reviews_public as
select r.id,
       r.company_id,
       r.rating,
       r.comment,
       r.created_at,
       r.updated_at,
       case when cp.status = 'deleted' then 'Deleted creator' else cp.first_name end as creator_name,
       (r.creator_id = (select auth.uid())) as is_mine
from public.company_reviews r
join public.creator_profiles cp on cp.id = r.creator_id
where not r.is_hidden
  and (
    r.company_id = (select auth.uid())
    or public.is_admin()
    or exists (select 1 from public.profiles p
               where p.id = (select auth.uid()) and p.role = 'creator')
  );
revoke all on public.company_reviews_public from anon, public;
grant select on public.company_reviews_public to authenticated;

-- A brand's public page for creators: name, joined date and rating.
create or replace view public.company_public_profiles as
select co.id,
       co.name,
       co.created_at,
       (select round(avg(r.rating)::numeric, 1)
          from public.company_reviews r
         where r.company_id = co.id and not r.is_hidden) as rating_avg,
       (select count(*)::int
          from public.company_reviews r
         where r.company_id = co.id and not r.is_hidden) as review_count
from public.company_profiles co
where co.status = 'active'
  and (
    co.id = (select auth.uid())
    or public.is_admin()
    or exists (select 1 from public.profiles p
               where p.id = (select auth.uid()) and p.role = 'creator')
  );
revoke all on public.company_public_profiles from anon, public;
grant select on public.company_public_profiles to authenticated;

-- Project listings gain company_id (appended) so a project can link to its brand page.
create or replace view public.project_listings as
 SELECT pr.id,
    pr.title,
    pr.description,
    pr.budget_usd_cents,
    pr.delivery_deadline,
    pr.status,
    pr.created_at,
    pr.updated_at,
    co.name AS company_name,
    COALESCE(( SELECT array_agg(ps.service_id) AS array_agg
           FROM project_services ps
          WHERE ps.project_id = pr.id), '{}'::uuid[]) AS service_ids,
    COALESCE(( SELECT array_agg(pn.niche_id) AS array_agg
           FROM project_niches pn
          WHERE pn.project_id = pr.id), '{}'::uuid[]) AS niche_ids,
    COALESCE(( SELECT array_agg(pl.language_id) AS array_agg
           FROM project_languages pl
          WHERE pl.project_id = pr.id), '{}'::uuid[]) AS language_ids,
    pr.payment_methods,
    pr.company_id
   FROM projects pr
     JOIN company_profiles co ON co.id = pr.company_id
  WHERE is_admin() OR (EXISTS ( SELECT 1
           FROM creator_profiles cp
          WHERE cp.id = (( SELECT auth.uid() AS uid)) AND cp.status = 'active'::account_status)) AND (pr.status = 'open'::project_status OR (EXISTS ( SELECT 1
           FROM project_applications a
          WHERE a.project_id = pr.id AND a.creator_id = (( SELECT auth.uid() AS uid)))));
