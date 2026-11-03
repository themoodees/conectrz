-- Replaces admin_delete_account: the database can't delete logins itself, so the admin-delete-account
-- edge function checks the caller is an admin, runs this cleanup (service role only), then deletes the login.
drop function if exists public.admin_delete_account(uuid);

create or replace function public.admin_purge_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_role public.user_role;
begin
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

  -- The profile (and everything under it) goes when the edge function deletes the login.
end;
$$;

revoke all on function public.admin_purge_account(uuid) from public, anon, authenticated;
grant execute on function public.admin_purge_account(uuid) to service_role;
