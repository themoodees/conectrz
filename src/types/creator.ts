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

/** Mirrors the `creator_profiles.gender` values. */
export type Gender = "woman" | "man" | "other";

export interface CreatorLanguage {
  name: string;
  proficiency: LanguageProficiency;
}

export interface CreatorService {
  name: string;
  rateType: RateType;
  rateAmountUsd: number;
}

export interface SocialAccount {
  platform: SocialPlatform;
  /** Hidden (null) for companies on the Free plan. */
  handle: string | null;
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
  /** Optional, chosen by the creator. */
  gender?: Gender | null;
  /** Calculated from the creator's birth date; the birth date itself is never shown. */
  age?: number | null;
  /** Average of visible reviews (1-5), null when there are none. */
  ratingAverage?: number | null;
  reviewCount?: number;
}

export interface CreatorReview {
  id: string;
  rating: number;
  comment: string | null;
  companyName: string;
  createdAt: string;
  /** The signed-in company wrote this review. */
  isMine: boolean;
}

export interface PortfolioItem {
  id: string;
  mediaUrl: string;
  /** e.g. "image" or "video" */
  mediaType: string;
  title: string | null;
  description: string | null;
}

/** Everything shown on the Creator Profile page. */
export interface CreatorProfile extends Creator {
  portfolio: PortfolioItem[];
  reviews: CreatorReview[];
}
