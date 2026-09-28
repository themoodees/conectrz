/*
 * Product types for Creators.
 * Shaped after the Supabase schema (creator_profiles, creator_languages,
 * creator_niches, creator_services, social_accounts) so mock data can later
 * be swapped for real queries without changing components.
 */

/** Mirrors the `language_proficiency` enum. */
export type LanguageProficiency = "native" | "fluent" | "conversational";

/** Mirrors the `rate_type` enum. */
export type RateType = "flat" | "starting_from";

/**
 * Platforms the UI knows how to label/iconify.
 * `social_accounts.platform` is free text in the DB, so keep this list in sync.
 */
export type SocialPlatform = "instagram" | "tiktok" | "youtube" | "x";

export interface CreatorLanguage {
  name: string;
  proficiency: LanguageProficiency;
}

export interface CreatorService {
  name: string;
  rateType: RateType;
  rateAmountJpy: number;
}

export interface SocialAccount {
  platform: SocialPlatform;
  handle: string;
  profileUrl?: string | null;
  /** Nullable: UGC-focused creators may not report an audience. */
  followerCount: number | null;
}

export interface Creator {
  id: string;
  displayName: string;
  photoUrl: string | null;
  bio?: string | null;
  country: string;
  prefecture: string | null;
  city: string | null;
  isAvailable: boolean;
  languages: CreatorLanguage[];
  niches: string[];
  services: CreatorService[];
  socialAccounts: SocialAccount[];
}
