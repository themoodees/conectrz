-- Creators cannot read the projects table (they use the project_listings view), so the
-- "project is open" check inside the insert policy always failed for them.
create or replace function public.project_is_open(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id and p.status = 'open'
  );
$$;
revoke all on function public.project_is_open(uuid) from public, anon;
grant execute on function public.project_is_open(uuid) to authenticated;

drop policy if exists "applications insert" on public.project_applications;
create policy "applications insert" on public.project_applications
  for insert with check (
    creator_id = (select auth.uid())
    and status = 'submitted'
    and public.creator_is_published((select auth.uid()))
    and public.project_is_open(project_id)
  );
