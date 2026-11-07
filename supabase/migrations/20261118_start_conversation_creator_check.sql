-- Fix: companies could not start conversations ("creator_not_available").
-- start_conversation checked creator_profiles directly, but RLS lets only the creator (or an
-- admin) read that table, so the check always failed for companies.
-- A tiny SECURITY DEFINER helper answers only "is this creator active?" and nothing else.

create or replace function public.is_active_creator(p_creator_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.creator_profiles
    where id = p_creator_id and status = 'active'
  );
$$;

revoke all on function public.is_active_creator(uuid) from public, anon;
grant execute on function public.is_active_creator(uuid) to authenticated;

create or replace function public.start_conversation(p_creator_id uuid, p_message text)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_conversation_id uuid;
  v_message text := btrim(p_message);
begin
  if v_message is null or v_message = '' then
    raise exception 'empty_message';
  end if;
  if length(v_message) > 5000 then
    raise exception 'message_too_long';
  end if;
  if not exists (
    select 1 from public.company_profiles
    where id = (select auth.uid()) and status = 'active'
  ) then
    raise exception 'company_not_active';
  end if;
  if not public.is_active_creator(p_creator_id) then
    raise exception 'creator_not_available';
  end if;

  insert into public.conversations (creator_id, company_id)
  values (p_creator_id, (select auth.uid()))
  returning id into v_conversation_id;

  insert into public.messages (conversation_id, sender_id, content)
  values (v_conversation_id, (select auth.uid()), v_message);

  return v_conversation_id;
end;
$$;

notify pgrst, 'reload schema';
