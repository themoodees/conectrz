-- Project references: companies can attach links and images to a project brief.
-- Images live in the private "project-references" bucket, in the company's own folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-references', 'project-references', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "companies upload project references" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-references'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.profiles p
                where p.id = (select auth.uid()) and p.role = 'company')
  );

create policy "companies delete own project references" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'project-references'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "logged in users read project references" on storage.objects
  for select to authenticated
  using (bucket_id = 'project-references');

create table public.project_references (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  kind        text not null check (kind in ('link', 'image')),
  url         text not null check (char_length(url) <= 500),
  created_at  timestamptz not null default now()
);
create index project_references_project_idx on public.project_references (project_id);

alter table public.project_references enable row level security;

-- Who can read: the company that owns the project, admins, and creators who can see the project.
create policy "project references select" on public.project_references
  for select using (
    exists (select 1 from public.projects p
            where p.id = project_references.project_id
              and p.company_id = (select auth.uid()))
    or public.is_admin()
    or exists (select 1 from public.project_listings l where l.id = project_references.project_id)
  );

create policy "project references insert" on public.project_references
  for insert with check (
    exists (select 1 from public.projects p
            where p.id = project_references.project_id
              and p.company_id = (select auth.uid())
              and p.status = 'open')
  );

create policy "project references delete" on public.project_references
  for delete using (
    exists (select 1 from public.projects p
            where p.id = project_references.project_id
              and p.company_id = (select auth.uid()))
  );

-- At most 5 links and 6 images per project.
create or replace function public.limit_project_references()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  used int;
  cap  int := case when new.kind = 'link' then 5 else 6 end;
begin
  select count(*) into used from public.project_references r
   where r.project_id = new.project_id and r.kind = new.kind;
  if used >= cap then
    raise exception 'Too many % references for this project', new.kind;
  end if;
  return new;
end;
$$;
create trigger project_references_limit before insert on public.project_references
  for each row execute function public.limit_project_references();
