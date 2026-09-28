import "server-only";
import { cache } from "react";
import type {
  Creator,
  CreatorProfile,
  LanguageProficiency,
  RateType,
  SocialAccount,
  SocialPlatform,
} from "@/types/creator";
import type { DiscoveryFilterOptions } from "@/types/discovery";
import { isMockMode } from "@/lib/config";
import { PLATFORM_OPTIONS } from "@/lib/discovery/filterConfig";
import { mockCreators } from "@/mocks/creators";
import { mockFilterOptions } from "@/mocks/filterOptions";
import { mockPortfolio } from "@/mocks/portfolio";
import { getSupabaseSession } from "./session";

/*
 * Data access for creators. Pages call these functions — never the mocks or
 * Supabase directly — so the data source can switch without touching the UI.
 */

// Columns + related tables needed to build a `Creator`.
const CREATOR_SELECT = `
  id, display_name, photo_url, bio, country, prefecture, city, is_available,
  creator_languages ( proficiency, languages ( name ) ),
  creator_niches ( niches ( name ) ),
  creator_services ( rate_type, rate_amount_jpy, services ( name ) ),
  social_accounts ( platform, handle, profile_url, follower_count )
`;

interface CreatorRow {
  id: string;
  display_name: string;
  photo_url: string | null;
  bio: string | null;
  country: string;
  prefecture: string | null;
  city: string | null;
  is_available: boolean;
  creator_languages: { proficiency: LanguageProficiency; languages: { name: string } | null }[];
  creator_niches: { niches: { name: string } | null }[];
  creator_services: {
    rate_type: RateType;
    rate_amount_jpy: number;
    services: { name: string } | null;
  }[];
  social_accounts: {
    platform: string;
    handle: string;
    profile_url: string | null;
    follower_count: number | null;
  }[];
}

const isKnownPlatform = (platform: string): platform is SocialPlatform =>
  (PLATFORM_OPTIONS as string[]).includes(platform);

function toCreator(row: CreatorRow): Creator {
  return {
    id: row.id,
    displayName: row.display_name,
    photoUrl: row.photo_url,
    bio: row.bio,
    country: row.country,
    prefecture: row.prefecture,
    city: row.city,
    isAvailable: row.is_available,
    languages: row.creator_languages.flatMap((l) =>
      l.languages ? [{ name: l.languages.name, proficiency: l.proficiency }] : [],
    ),
    niches: row.creator_niches.flatMap((n) => (n.niches ? [n.niches.name] : [])),
    services: row.creator_services.flatMap((s) =>
      s.services
        ? [{ name: s.services.name, rateType: s.rate_type, rateAmountJpy: s.rate_amount_jpy }]
        : [],
    ),
    // Platforms the UI doesn't know yet are skipped rather than shown unlabeled.
    socialAccounts: row.social_accounts.flatMap((a): SocialAccount[] => {
      const platform = a.platform.toLowerCase();
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
  };
}

/** Creators (active only by default), optionally limited to specific ids. */
async function fetchCreators(ids?: string[], { activeOnly = true } = {}): Promise<Creator[]> {
  const { supabase } = await getSupabaseSession();
  let query = supabase
    .from("creator_profiles")
    .select(CREATOR_SELECT)
    .order("created_at", { ascending: false });
  if (activeOnly) query = query.eq("status", "active");
  if (ids) query = query.in("id", ids);

  const { data, error } = await query.overrideTypes<CreatorRow[], { merge: false }>();
  if (error) throw error;
  return data.map(toCreator);
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

    const [creator] = await fetchCreators([id], { activeOnly });
    if (!creator) return null;

    const { supabase } = await getSupabaseSession();
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("id, media_url, media_type, title, description")
      .eq("creator_id", id)
      .order("created_at", { ascending: false });
    if (error) throw error;

    return {
      ...creator,
      portfolio: data.map((item) => ({
        id: item.id,
        mediaUrl: item.media_url,
        mediaType: item.media_type,
        title: item.title,
        description: item.description,
      })),
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
    supabase.from("creator_profiles").select("prefecture").eq("status", "active"),
  ]);
  if (prefectures.error) throw prefectures.error;

  // Locations: the prefectures active creators actually live in.
  const locations = [
    ...new Set(prefectures.data.flatMap((row) => (row.prefecture ? [row.prefecture] : []))),
  ].sort();

  return { niches, languages, services, locations };
}
