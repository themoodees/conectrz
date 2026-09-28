import "server-only";
import { cache } from "react";
import type { AccountStatus } from "@/types/account";
import type { SocialPlatform } from "@/types/creator";
import type { CreatorEditorData, CreatorEditorOptions } from "@/types/creatorEditor";
import { isMockMode } from "@/lib/config";
import { PLATFORM_OPTIONS } from "@/lib/discovery/filterConfig";
import { MOCK_CREATOR_ID } from "@/mocks/account";
import { mockCreators } from "@/mocks/creators";
import { mockFilterOptions } from "@/mocks/filterOptions";
import { mockPortfolio } from "@/mocks/portfolio";
import { getSupabaseSession } from "./session";

/*
 * Data for the signed-in creator's own account (the creator area).
 * In mock mode the creator is MOCK_CREATOR_ID and lookup ids are the names.
 */

export interface OwnCreatorSummary {
  id: string;
  displayName: string;
  status: AccountStatus;
}

/** The signed-in creator's profile basics, or null if they haven't onboarded yet. */
export const getOwnCreatorSummary = cache(async (): Promise<OwnCreatorSummary | null> => {
  if (isMockMode) {
    const creator = mockCreators.find((c) => c.id === MOCK_CREATOR_ID)!;
    return { id: creator.id, displayName: creator.displayName, status: "active" };
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return null;
  const { data, error } = await supabase
    .from("creator_profiles")
    .select("id, display_name, status")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data ? { id: data.id, displayName: data.display_name, status: data.status } : null;
});

export async function getEditorOptions(): Promise<CreatorEditorOptions> {
  if (isMockMode) {
    const toOptions = (names: string[]) => names.map((name) => ({ id: name, name }));
    return {
      niches: toOptions(mockFilterOptions.niches),
      languages: toOptions(mockFilterOptions.languages),
      services: toOptions(mockFilterOptions.services),
    };
  }

  const { supabase } = await getSupabaseSession();
  const load = async (table: "niches" | "languages" | "services") => {
    const { data, error } = await supabase
      .from(table)
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return data;
  };
  const [niches, languages, services] = await Promise.all([
    load("niches"),
    load("languages"),
    load("services"),
  ]);
  return { niches, languages, services };
}

const isKnownPlatform = (platform: string): platform is SocialPlatform =>
  (PLATFORM_OPTIONS as string[]).includes(platform);

export async function getOwnCreatorEditorData(): Promise<CreatorEditorData | null> {
  if (isMockMode) {
    const creator = mockCreators.find((c) => c.id === MOCK_CREATOR_ID)!;
    return {
      id: creator.id,
      status: "active",
      displayName: creator.displayName,
      bio: creator.bio ?? "",
      prefecture: creator.prefecture ?? "",
      city: creator.city ?? "",
      isAvailable: creator.isAvailable,
      photoUrl: creator.photoUrl,
      nicheIds: creator.niches,
      languages: creator.languages.map((l) => ({ languageId: l.name, proficiency: l.proficiency })),
      services: creator.services.map((s) => ({
        serviceId: s.name,
        rateType: s.rateType,
        rateAmountJpy: s.rateAmountJpy,
      })),
      socialAccounts: creator.socialAccounts.map((a, index) => ({
        id: `sa-${index}`,
        platform: a.platform,
        handle: a.handle,
        profileUrl: a.profileUrl ?? "",
        followerCount: a.followerCount,
      })),
      portfolio: mockPortfolio[creator.id] ?? [],
    };
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return null;

  const { data, error } = await supabase
    .from("creator_profiles")
    .select(
      `id, status, display_name, bio, prefecture, city, is_available, photo_url,
       creator_niches ( niche_id ),
       creator_languages ( language_id, proficiency ),
       creator_services ( service_id, rate_type, rate_amount_jpy ),
       social_accounts ( id, platform, handle, profile_url, follower_count ),
       portfolio_items ( id, media_url, media_type, title, description, created_at )`,
    )
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    status: data.status,
    displayName: data.display_name,
    bio: data.bio ?? "",
    prefecture: data.prefecture ?? "",
    city: data.city ?? "",
    isAvailable: data.is_available,
    photoUrl: data.photo_url,
    nicheIds: data.creator_niches.map((n) => n.niche_id),
    languages: data.creator_languages.map((l) => ({
      languageId: l.language_id,
      proficiency: l.proficiency,
    })),
    services: data.creator_services.map((s) => ({
      serviceId: s.service_id,
      rateType: s.rate_type,
      rateAmountJpy: s.rate_amount_jpy,
    })),
    socialAccounts: data.social_accounts.flatMap((a) => {
      const platform = a.platform.toLowerCase();
      return isKnownPlatform(platform)
        ? [
            {
              id: a.id,
              platform,
              handle: a.handle,
              profileUrl: a.profile_url ?? "",
              followerCount: a.follower_count,
            },
          ]
        : [];
    }),
    portfolio: [...data.portfolio_items]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((item) => ({
        id: item.id,
        mediaUrl: item.media_url,
        mediaType: item.media_type,
        title: item.title,
        description: item.description,
      })),
  };
}
