-- Companies can edit an open project. edited_at records the last time the brief itself changed
-- (not status changes), so creators can see "Edited <date>".
alter table public.projects add column if not exists edited_at timestamptz;

-- Same view as before, with edited_at added as the last column.
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
    pr.company_id,
    pr.written_language,
    pr.edited_at
   FROM projects pr
     JOIN company_profiles co ON co.id = pr.company_id
  WHERE is_admin() OR (EXISTS ( SELECT 1
           FROM creator_profiles cp
          WHERE cp.id = (( SELECT auth.uid() AS uid)) AND cp.status = 'active'::account_status)) AND (pr.status = 'open'::project_status OR (EXISTS ( SELECT 1
           FROM project_applications a
          WHERE a.project_id = pr.id AND a.creator_id = (( SELECT auth.uid() AS uid)))));

-- Saves an edit atomically: the brief and its services / niches / languages / references
-- change together or not at all. Runs as the caller, so RLS still applies (own, open projects).
-- Returns the storage paths of reference images that were removed, for the app to delete.
create or replace function public.update_project(
  p_project_id uuid,
  p_title text,
  p_description text,
  p_written_language text,
  p_budget_usd_cents integer,
  p_delivery_deadline date,
  p_payment_methods public.projects.payment_methods%type,
  p_service_ids uuid[],
  p_niche_ids uuid[],
  p_language_ids uuid[],
  p_reference_links text[],
  p_reference_images text[]
) returns text[]
language plpgsql
set search_path = ''
as $$
declare
  cur public.projects;
  old_services uuid[];
  old_niches uuid[];
  old_languages uuid[];
  old_refs text[];
  new_refs text[];
  removed text[];
  changed boolean;
begin
  select * into cur from public.projects
   where id = p_project_id and company_id = (select auth.uid())
   for update;
  if not found then raise exception 'project_not_found'; end if;
  if cur.status <> 'open' then raise exception 'project_closed'; end if;

  select coalesce(array_agg(service_id order by service_id), '{}') into old_services
    from public.project_services where project_id = p_project_id;
  select coalesce(array_agg(niche_id order by niche_id), '{}') into old_niches
    from public.project_niches where project_id = p_project_id;
  select coalesce(array_agg(language_id order by language_id), '{}') into old_languages
    from public.project_languages where project_id = p_project_id;
  select coalesce(array_agg(kind || ':' || url order by kind || ':' || url), '{}') into old_refs
    from public.project_references where project_id = p_project_id;
  select coalesce(array_agg(r order by r), '{}') into new_refs from (
    select 'link:' || x as r from unnest(p_reference_links) x
    union all
    select 'image:' || x from unnest(p_reference_images) x
  ) s;

  changed :=
    cur.title is distinct from p_title
    or cur.description is distinct from p_description
    or cur.written_language is distinct from p_written_language
    or cur.budget_usd_cents is distinct from p_budget_usd_cents
    or cur.delivery_deadline is distinct from p_delivery_deadline
    or (select coalesce(array_agg(m order by m), '{}') from unnest(cur.payment_methods) m)
       is distinct from
       (select coalesce(array_agg(m order by m), '{}') from unnest(p_payment_methods) m)
    or old_services is distinct from
       (select coalesce(array_agg(x order by x), '{}') from unnest(p_service_ids) x)
    or old_niches is distinct from
       (select coalesce(array_agg(x order by x), '{}') from unnest(p_niche_ids) x)
    or old_languages is distinct from
       (select coalesce(array_agg(x order by x), '{}') from unnest(p_language_ids) x)
    or old_refs is distinct from new_refs;

  update public.projects set
    title = p_title,
    description = p_description,
    written_language = p_written_language,
    budget_usd_cents = p_budget_usd_cents,
    delivery_deadline = p_delivery_deadline,
    payment_methods = p_payment_methods,
    edited_at = case when changed then now() else edited_at end
  where id = p_project_id;

  select coalesce(array_agg(url), '{}') into removed
    from public.project_references
   where project_id = p_project_id and kind = 'image' and url <> all (p_reference_images);

  delete from public.project_services where project_id = p_project_id;
  delete from public.project_niches where project_id = p_project_id;
  delete from public.project_languages where project_id = p_project_id;
  delete from public.project_references where project_id = p_project_id;

  insert into public.project_services (project_id, service_id)
    select p_project_id, x from unnest(p_service_ids) x;
  insert into public.project_niches (project_id, niche_id)
    select p_project_id, x from unnest(p_niche_ids) x;
  insert into public.project_languages (project_id, language_id)
    select p_project_id, x from unnest(p_language_ids) x;
  insert into public.project_references (project_id, kind, url)
    select p_project_id, 'link', x from unnest(p_reference_links) x;
  insert into public.project_references (project_id, kind, url)
    select p_project_id, 'image', x from unnest(p_reference_images) x;

  return removed;
end;
$$;

revoke execute on function public.update_project from public, anon;
grant execute on function public.update_project to authenticated;

notify pgrst, 'reload schema';
