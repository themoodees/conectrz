-- Login emails for the admin accounts list. Emails live in auth.users, which the app
-- can't read directly, so this function exposes them to admins only.
create or replace function public.admin_account_emails()
returns table (id uuid, email text)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.email::text
  from auth.users u
  where (select public.is_admin());
$$;

revoke all on function public.admin_account_emails() from public, anon;
grant execute on function public.admin_account_emails() to authenticated;
