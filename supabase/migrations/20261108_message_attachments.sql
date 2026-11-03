-- Chat attachments: images and videos in conversations.
-- Files live in the private "message-attachments" bucket under <conversation-id>/<user-id>/.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('message-attachments', 'message-attachments', false, 52428800,
        array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'])
on conflict (id) do nothing;

create policy "participants upload message attachments" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'message-attachments'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and exists (select 1 from public.conversations c
                where c.id::text = (storage.foldername(name))[1]
                  and (c.company_id = (select auth.uid()) or c.creator_id = (select auth.uid())))
  );

create policy "participants read message attachments" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'message-attachments'
    and exists (select 1 from public.conversations c
                where c.id::text = (storage.foldername(name))[1]
                  and (c.company_id = (select auth.uid()) or c.creator_id = (select auth.uid())))
  );

create policy "senders delete own message attachments" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'message-attachments'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

create table public.message_attachments (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references public.messages(id) on delete cascade,
  path        text not null check (char_length(path) <= 300),
  kind        text not null check (kind in ('image', 'video')),
  file_name   text not null check (char_length(file_name) <= 200),
  size_bytes  bigint not null check (size_bytes > 0),
  created_at  timestamptz not null default now()
);
create index message_attachments_message_idx on public.message_attachments (message_id);

alter table public.message_attachments enable row level security;

-- Anyone who can read the message can read its attachments (the messages policy decides).
create policy "message attachments select" on public.message_attachments
  for select using (
    exists (select 1 from public.messages m where m.id = message_attachments.message_id)
  );

create policy "message attachments insert" on public.message_attachments
  for insert with check (
    exists (select 1 from public.messages m
            where m.id = message_attachments.message_id
              and m.sender_id = (select auth.uid()))
  );

-- At most 5 attachments per message.
create or replace function public.limit_message_attachments()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  used int;
begin
  select count(*) into used from public.message_attachments a where a.message_id = new.message_id;
  if used >= 5 then
    raise exception 'Too many attachments on this message';
  end if;
  return new;
end;
$$;
create trigger message_attachments_limit before insert on public.message_attachments
  for each row execute function public.limit_message_attachments();
