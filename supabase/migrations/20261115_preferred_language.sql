-- The language each user reads the site in. Follows the account across devices and will also
-- decide which language chat messages and emails are translated into.
alter table public.profiles
  add column if not exists preferred_language text
  check (preferred_language in ('en', 'ja', 'pt', 'es', 'fr'));

-- Users can only change this one column on their own row (profiles has no update policy).
create or replace function public.set_my_language(lang text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
     set preferred_language = lang
   where id = (select auth.uid())
     and lang in ('en', 'ja', 'pt', 'es', 'fr');
$$;

revoke all on function public.set_my_language(text) from public, anon;
grant execute on function public.set_my_language(text) to authenticated;
