-- Creators pick their city / ward from the official municipality list (全国地方公共団体コード)
-- instead of typing it. `city_code` is the 5-digit code (e.g. 13113 = 渋谷区); the site shows the
-- name in the reader's language. `city` (text) stays: it holds the English name for picked cities
-- and the creator's own text when they choose "Other".

alter table public.creator_profiles
  add column if not exists city_code text check (city_code ~ '^[0-9]{5}$');

-- Same plan gating as `city`: only paid-plan companies see the city.
create or replace view public.creator_directory as
 SELECT id,
    first_name,
        CASE
            WHEN public.has_paid_plan() THEN last_name
            ELSE NULL::text
        END AS last_name,
    photo_url,
    bio,
    country,
    prefecture,
    is_available,
        CASE
            WHEN public.has_paid_plan() THEN city
            ELSE NULL::text
        END AS city,
    gender,
        CASE
            WHEN birth_date IS NOT NULL THEN EXTRACT(year FROM age(CURRENT_DATE::timestamp with time zone, birth_date::timestamp with time zone))::integer
            ELSE NULL::integer
        END AS age,
    ( SELECT round(avg(r.rating), 1) AS round
           FROM public.creator_reviews r
          WHERE r.creator_id = cp.id AND NOT r.is_hidden) AS rating_avg,
    ( SELECT count(*)::integer AS count
           FROM public.creator_reviews r
          WHERE r.creator_id = cp.id AND NOT r.is_hidden) AS review_count,
    payment_methods,
        CASE
            WHEN public.has_paid_plan() THEN city_code
            ELSE NULL::text
        END AS city_code
   FROM public.creator_profiles cp
  WHERE public.creator_is_published(id) AND (public.is_admin() OR (EXISTS ( SELECT 1
           FROM public.profiles p
          WHERE p.id = (( SELECT auth.uid() AS uid)) AND p.role = 'company'::public.user_role)));

-- Existing creators who typed Kakegawa (Shizuoka) -> 掛川市.
update public.creator_profiles
   set city_code = '22213'
 where city_code is null and prefecture = 'Shizuoka' and lower(btrim(city)) = 'kakegawa';

notify pgrst, 'reload schema';
