-- The language a project brief is written in, so creators can see it at a glance and filter by it.
alter table public.projects
  add column if not exists written_language text
  check (written_language in ('en', 'ja', 'pt', 'es', 'fr'));

-- Existing projects: Japanese if the brief contains Japanese characters, otherwise English.
update public.projects
   set written_language = case
     when (title || ' ' || description) ~ '[ぁ-んァ-ヶ一-龥]' then 'ja'
     else 'en'
   end
 where written_language is null;

-- Same view as before, with written_language added as the last column.
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
    pr.written_language
   FROM projects pr
     JOIN company_profiles co ON co.id = pr.company_id
  WHERE is_admin() OR (EXISTS ( SELECT 1
           FROM creator_profiles cp
          WHERE cp.id = (( SELECT auth.uid() AS uid)) AND cp.status = 'active'::account_status)) AND (pr.status = 'open'::project_status OR (EXISTS ( SELECT 1
           FROM project_applications a
          WHERE a.project_id = pr.id AND a.creator_id = (( SELECT auth.uid() AS uid)))));
