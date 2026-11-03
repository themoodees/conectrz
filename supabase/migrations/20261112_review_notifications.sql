-- Notify the reviewed party when a review is first posted (edits do not notify again).
alter type public.notification_type add value if not exists 'new_creator_review';
alter type public.notification_type add value if not exists 'new_company_review';

create or replace function public.notify_new_creator_review()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (user_id, type, payload)
  values (new.creator_id, 'new_creator_review',
          jsonb_build_object('review_id', new.id, 'company_id', new.company_id, 'rating', new.rating));
  return new;
end;
$$;

create or replace function public.notify_new_company_review()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (user_id, type, payload)
  values (new.company_id, 'new_company_review',
          jsonb_build_object('review_id', new.id, 'creator_id', new.creator_id, 'rating', new.rating));
  return new;
end;
$$;

create trigger creator_reviews_notify after insert on public.creator_reviews
  for each row execute function public.notify_new_creator_review();
create trigger company_reviews_notify after insert on public.company_reviews
  for each row execute function public.notify_new_company_review();

revoke execute on function public.notify_new_creator_review() from public, anon, authenticated;
revoke execute on function public.notify_new_company_review() from public, anon, authenticated;
