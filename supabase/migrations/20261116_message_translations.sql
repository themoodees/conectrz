-- Automatic chat translation. A translation is stored once per (message, language) so each
-- message is only translated (and paid for) once, however many times it is opened.
create table public.message_translations (
  message_id uuid not null references public.messages (id) on delete cascade,
  language text not null check (language in ('en', 'ja', 'pt', 'es', 'fr')),
  -- Language the original was written in (as detected by the translation provider).
  source_language text not null,
  -- Translated text. Equals the original when source_language = language.
  content text not null,
  provider text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, language)
);

alter table public.message_translations enable row level security;

-- Participants of the conversation (and admins) can read; only the edge function
-- (service role) writes.
create policy "participants read translations" on public.message_translations
  for select using (
    exists (
      select 1
      from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_id
        and (c.creator_id = (select auth.uid()) or c.company_id = (select auth.uid()))
    )
    or (select public.is_admin())
  );
