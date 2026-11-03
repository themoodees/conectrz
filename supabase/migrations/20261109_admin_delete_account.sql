-- Admin permanent account deletion, step 1: a new action type for the activity log.
-- (The function created here originally was replaced in 20261110.)
alter type public.admin_action_type add value if not exists 'account_deleted';

create or replace function public.admin_delete_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_role public.user_role;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'admins_only';
  end if;

  select role into target_role from public.profiles where id = p_user_id;
  if target_role is null then
    raise exception 'account_not_found';
  end if;
  if target_role = 'admin' then
    raise exception 'cannot_delete_admin';
  end if;

  -- A live Stripe subscription would keep charging the card: cancel it first.
  if exists (
    select 1 from public.subscriptions s
    where s.company_id = p_user_id
      and s.stripe_subscription_id is not null
      and s.status::text in ('active', 'trialing', 'past_due')
  ) then
    raise exception 'cancel_plan_first';
  end if;

  -- Rows that would block the delete (no cascade): reports, applications, projects, conversations.
  delete from public.reports r
   where r.reporter_id = p_user_id
      or r.target_creator_id = p_user_id
      or r.target_company_id = p_user_id
      or r.target_conversation_id in (
           select c.id from public.conversations c
           where c.creator_id = p_user_id or c.company_id = p_user_id)
      or r.target_project_id in (select p.id from public.projects p where p.company_id = p_user_id)
      or r.target_application_id in (
           select a.id from public.project_applications a
           where a.creator_id = p_user_id
              or a.project_id in (select p.id from public.projects p where p.company_id = p_user_id));

  delete from public.project_applications a
   where a.creator_id = p_user_id
      or a.project_id in (select p.id from public.projects p where p.company_id = p_user_id);
  delete from public.projects where company_id = p_user_id;
  delete from public.conversations where creator_id = p_user_id or company_id = p_user_id; -- messages cascade
  delete from public.subscriptions where company_id = p_user_id;

  -- Removing the login cascades to the profile and everything else that hangs off it.
  delete from auth.users where id = p_user_id;
end;
$$;

revoke all on function public.admin_delete_account(uuid) from public, anon;
grant execute on function public.admin_delete_account(uuid) to authenticated;
