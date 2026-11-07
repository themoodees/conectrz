-- Translations of project briefs (title + description), stored once per (project, language)
-- so a brief is translated (and paid for) once, however many creators open it.
create table public.project_translations (
  project_id uuid not null references public.projects (id) on delete cascade,
  language text not null check (language in ('en', 'ja', 'pt', 'es', 'fr')),
  source_language text not null,
  title text not null,
  description text not null,
  provider text not null,
  created_at timestamptz not null default now(),
  primary key (project_id, language)
);

alter table public.project_translations enable row level security;

-- Whoever can see the project can read its translations: the owning company, active creators
-- (for open projects or ones they applied to) and admins. Only the edge function (service role) writes.
create policy "project viewers read translations" on public.project_translations
  for select using (
    (select public.is_admin())
    or exists (
      select 1 from public.projects pr
      where pr.id = project_id and pr.company_id = (select auth.uid())
    )
    or exists (
      select 1 from public.project_listings pl
      where pl.id = project_id
    )
  );

-- If the company edits the brief, the stored translations are out of date: drop them so the
-- next "Translate" request starts fresh.
create or replace function public.clear_project_translations()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.title is distinct from old.title or new.description is distinct from old.description then
    delete from public.project_translations where project_id = new.id;
  end if;
  return new;
end;
$$;

revoke execute on function public.clear_project_translations() from public, anon, authenticated;

create trigger projects_clear_translations
  after update of title, description on public.projects
  for each row execute function public.clear_project_translations();

notify pgrst, 'reload schema';
