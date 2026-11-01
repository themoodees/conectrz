import "server-only";
import { cache } from "react";
import type {
  Creator,
  CreatorProfile,
  SocialAccount,
  SocialPlatform,
} from "@/types/creator";
import type { DiscoveryFilterOptions } from "@/types/discovery";
import { isMockMode } from "@/lib/config";
import { centsToUsd } from "@/lib/format";
import { PLATFORM_OPTIONS } from "@/lib/discovery/filterConfig";
import { mockCreators } from "@/mocks/creators";
import { mockFilterOptions } from "@/mocks/filterOptions";
import { mockPortfolio } from "@/mocks/portfolio";
import { getSupabaseSession } from "./session";
import { signMedia } from "./storage";

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

/** Creators, optionally limited to specific ids. `own` reads the base tables (the creator's own view). */
async function fetchCreators(ids?: string[], { own = false } = {}): Promise<Creator[]> {
  const { supabase } = await getSupabaseSession();
  const columns = "id, first_name, last_name, photo_url, bio, country, prefecture, city, is_available";

  let rows: BaseRow[];
  if (own) {
    let query = supabase.from("creator_profiles").select(columns);
    if (ids) query = query.in("id", ids);
    const { data, error } = await query.overrideTypes<BaseRow[], { merge: false }>();
    if (error) throw error;
    rows = data;
  } else {
    let query = supabase.from("creator_directory").select(columns);
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
      .select("creator_id, proficiency, languages ( name )")
      .in("creator_id", creatorIds),
    supabase
      .from("creator_niches")
      .select("creator_id, niches ( name )")
      .in("creator_id", creatorIds),
    supabase
      .from("creator_services")
      .select("creator_id, rate_type, rate_amount_usd_cents, services ( name )")
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
    languages: byCreator(languages.data!, row.id).flatMap((l) => {
      const language = l.languages as { name: string } | null;
      return language ? [{ name: language.name, proficiency: l.proficiency }] : [];
    }),
    niches: byCreator(niches.data!, row.id).flatMap((n) => {
      const niche = n.niches as { name: string } | null;
      return niche ? [niche.name] : [];
    }),
    services: byCreator(services.data!, row.id).flatMap((s) => {
      const service = s.services as { name: string } | null;
      return service
        ? [
            {
              name: service.name,
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
  if (isMockMode) return mockCreators;
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
      return creator ? { ...creator, portfolio: mockPortfolio[id] ?? [] } : null;
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
    return {
      ...creator,
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
  const activeNames = async (table: "niches" | "languages" | "services") => {
    const { data, error } = await supabase
      .from(table)
      .select("name")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return data.map((row) => row.name);
  };

  const [niches, languages, services, prefectures] = await Promise.all([
    activeNames("niches"),
    activeNames("languages"),
    activeNames("services"),
    supabase.from("creator_directory").select("prefecture"),
  ]);
  if (prefectures.error) throw prefectures.error;

  // Locations: the prefectures active creators actually live in.
  const locations = [
    ...new Set(prefectures.data.flatMap((row) => (row.prefecture ? [row.prefecture] : []))),
  ].sort();

  return { niches, languages, services, locations };
}
