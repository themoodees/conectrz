import "server-only";
import { cache } from "react";
import { getLocale } from "next-intl/server";
import type {
  Creator,
  Gender,
  CreatorProfile,
  SocialAccount,
  SocialPlatform,
} from "@/types/creator";
import type { DiscoveryFilterOptions } from "@/types/discovery";
import { isMockMode } from "@/lib/config";
import { centsToUsd } from "@/lib/format";
import { parsePaymentMethods } from "@/lib/payments";
import { PLATFORM_OPTIONS } from "@/lib/discovery/filterConfig";
import { mockCreators } from "@/mocks/creators";
import { mockFilterOptions } from "@/mocks/filterOptions";
import { PREFECTURES } from "@/lib/prefectures";
import { mockPortfolio } from "@/mocks/portfolio";
import { mockStore } from "@/mocks/store";
import { localizedName } from "@/lib/i18n/names";
import { getSupabaseSession } from "./session";
import { signMedia } from "./storage";
import { getCreatorReviews } from "./reviews";

/*
 * Data access for creators. Pages call these functions — never the mocks or
 * Supabase directly — so the data source can switch without touching the UI.
 */

/*
 * Company-facing reads go through the definer views `creator_directory` and
 * `creator_social_directory`: they only return published creators and hide
 * what the viewer's plan doesn't include (last name, city, handles, links).
 * A creator previewing their own profile reads the base tables instead.
 * Views have no foreign keys, so related rows are fetched separately and merged.
 */

interface BaseRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  bio: string | null;
  country: string | null;
  prefecture: string | null;
  city: string | null;
  is_available: boolean | null;
  gender?: string | null;
  age?: number | null;
  birth_date?: string | null;
  rating_avg?: number | null;
  review_count?: number | null;
  payment_methods?: string[] | null;
}

interface SocialRow {
  creator_id: string | null;
  platform: string | null;
  handle: string | null;
  profile_url: string | null;
  follower_count: number | null;
}

const isKnownPlatform = (platform: string): platform is SocialPlatform =>
  (PLATFORM_OPTIONS as string[]).includes(platform);

/** Full name when the viewer's plan includes it, otherwise the first name. */
export const fullName = (first: string | null, last: string | null) =>
  [first, last].filter(Boolean).join(" ") || "Creator";

function ageFromBirthDate(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const born = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  if (now < new Date(now.getFullYear(), born.getMonth(), born.getDate())) age -= 1;
  return age;
}

/** Creators, optionally limited to specific ids. `own` reads the base tables (the creator's own view). */
async function fetchCreators(ids?: string[], { own = false } = {}): Promise<Creator[]> {
  const { supabase } = await getSupabaseSession();
  const locale = await getLocale();
  const columns = "id, first_name, last_name, photo_url, bio, country, prefecture, city, is_available";
  // Companies get a calculated age and rating; the creator's own view reads the birth date.
  const ownColumns = `${columns}, gender, birth_date, payment_methods`;
  const directoryColumns = `${columns}, gender, age, rating_avg, review_count, payment_methods`;

  let rows: BaseRow[];
  if (own) {
    let query = supabase.from("creator_profiles").select(ownColumns);
    if (ids) query = query.in("id", ids);
    const { data, error } = await query.overrideTypes<BaseRow[], { merge: false }>();
    if (error) throw error;
    rows = data;
  } else {
    let query = supabase.from("creator_directory").select(directoryColumns);
    if (ids) query = query.in("id", ids);
    const { data, error } = await query.overrideTypes<BaseRow[], { merge: false }>();
    if (error) throw error;
    rows = data.filter((row) => row.id);
  }
  if (rows.length === 0) return [];

  const creatorIds = rows.map((row) => row.id);
  const [languages, niches, services, social, photos] = await Promise.all([
    supabase
      .from("creator_languages")
      .select("creator_id, proficiency, languages ( name, name_i18n )")
      .in("creator_id", creatorIds),
    supabase
      .from("creator_niches")
      .select("creator_id, niches ( name, name_i18n )")
      .in("creator_id", creatorIds),
    supabase
      .from("creator_services")
      .select("creator_id, rate_type, rate_amount_usd_cents, services ( name, name_i18n )")
      .in("creator_id", creatorIds),
    own
      ? supabase
          .from("social_accounts")
          .select("creator_id, platform, handle, profile_url, follower_count")
          .in("creator_id", creatorIds)
          .overrideTypes<SocialRow[], { merge: false }>()
      : supabase
          .from("creator_social_directory")
          .select("creator_id, platform, handle, profile_url, follower_count")
          .in("creator_id", creatorIds)
          .overrideTypes<SocialRow[], { merge: false }>(),
    signMedia(
      supabase,
      "creator-photos",
      rows.map((row) => row.photo_url),
    ),
  ]);
  for (const result of [languages, niches, services, social]) {
    if (result.error) throw result.error;
  }

  const byCreator = <T extends { creator_id: string | null }>(items: T[], id: string) =>
    items.filter((item) => item.creator_id === id);

  return rows.map((row, index): Creator => ({
    id: row.id,
    displayName: fullName(row.first_name, row.last_name),
    photoUrl: photos[index],
    bio: row.bio,
    country: row.country ?? "Japan",
    prefecture: row.prefecture,
    city: row.city,
    isAvailable: row.is_available ?? false,
    gender: (row.gender as Gender | null) ?? null,
    age: row.age ?? ageFromBirthDate(row.birth_date),
    ratingAverage: row.rating_avg ?? null,
    reviewCount: row.review_count ?? 0,
    paymentMethods: parsePaymentMethods(row.payment_methods),
    languages: byCreator(languages.data!, row.id).flatMap((l) => {
      const language = l.languages as { name: string; name_i18n: unknown } | null;
      return language ? [{ name: localizedName(language, locale), proficiency: l.proficiency }] : [];
    }),
    niches: byCreator(niches.data!, row.id).flatMap((n) => {
      const niche = n.niches as { name: string; name_i18n: unknown } | null;
      return niche ? [localizedName(niche, locale)] : [];
    }),
    services: byCreator(services.data!, row.id).flatMap((s) => {
      const service = s.services as { name: string; name_i18n: unknown } | null;
      return service
        ? [
            {
              name: localizedName(service, locale),
              rateType: s.rate_type,
              rateAmountUsd: centsToUsd(s.rate_amount_usd_cents),
            },
          ]
        : [];
    }),
    // Platforms the UI doesn't know yet are skipped rather than shown unlabeled.
    socialAccounts: byCreator(social.data!, row.id).flatMap((a): SocialAccount[] => {
      const platform = (a.platform ?? "").toLowerCase();
      return isKnownPlatform(platform)
        ? [
            {
              platform,
              handle: a.handle,
              profileUrl: a.profile_url,
              followerCount: a.follower_count,
            },
          ]
        : [];
    }),
  }));
}

export async function getDiscoverableCreators(): Promise<Creator[]> {
  if (isMockMode) {
    return mockCreators.map((creator) => {
      const reviews = mockStore.reviews.filter((r) => r.creatorId === creator.id);
      return {
        ...creator,
        reviewCount: reviews.length,
        ratingAverage: reviews.length
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
          : null,
      };
    });
  }
  return fetchCreators();
}

/** Creators by id, in the order the ids are given. */
export async function getCreatorsByIds(ids: string[]): Promise<Creator[]> {
  if (ids.length === 0) return [];
  const creators = isMockMode
    ? mockCreators.filter((creator) => ids.includes(creator.id))
    : await fetchCreators(ids);
  return ids.flatMap((id) => creators.find((creator) => creator.id === id) ?? []);
}

/**
 * A creator's full profile. Cached per request (the page and its metadata both use it).
 * `activeOnly: false` lets creators preview their own profile while paused.
 */
export const getCreatorProfile = cache(
  async (id: string, activeOnly: boolean = true): Promise<CreatorProfile | null> => {
    if (isMockMode) {
      const creator = mockCreators.find((c) => c.id === id);
      return creator
        ? { ...creator, portfolio: mockPortfolio[id] ?? [], reviews: await getCreatorReviews(id) }
        : null;
    }

    const [creator] = await fetchCreators([id], { own: !activeOnly });
    if (!creator) return null;

    const { supabase } = await getSupabaseSession();
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("id, media_url, media_type, title, description")
      .eq("creator_id", id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const urls = await signMedia(
      supabase,
      "portfolio",
      data.map((item) => item.media_url),
    );
    const reviews = await getCreatorReviews(id);
    return {
      ...creator,
      reviews,
      portfolio: data.flatMap((item, index) =>
        urls[index]
          ? [
              {
                id: item.id,
                mediaUrl: urls[index],
                mediaType: item.media_type,
                title: item.title,
                description: item.description,
              },
            ]
          : [],
      ),
    };
  },
);

export async function getDiscoveryFilterOptions(): Promise<DiscoveryFilterOptions> {
  if (isMockMode) return mockFilterOptions;

  const { supabase } = await getSupabaseSession();
  const locale = await getLocale();
  const activeNames = async (table: "niches" | "languages" | "services") => {
    const { data, error } = await supabase
      .from(table)
      .select("name, name_i18n")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return data.map((row) => localizedName(row, locale));
  };

  const [niches, languages, services] = await Promise.all([
    activeNames("niches"),
    activeNames("languages"),
    activeNames("services"),
  ]);

  // Locations: every prefecture, so the filter works even before creators exist there.
  const locations = [...PREFECTURES];
  return { niches, languages, services, locations };
}
