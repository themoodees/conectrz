import type { SocialPlatform } from "./creator";

/** Every filter available on Creator Discovery. */
export type FilterKey =
  | "niches"
  | "locations"
  | "languages"
  | "platforms"
  | "services"
  | "price"
  | "followers"
  | "availability";

/** Filters where several values can be selected at once. */
export type MultiSelectFilterKey = "niches" | "locations" | "languages" | "platforms" | "services";

export type PriceRangeId = "under-30k" | "30k-80k" | "80k-150k" | "150k-plus";
export type FollowerRangeId = "under-10k" | "10k-50k" | "50k-100k" | "100k-plus";

export interface DiscoveryFilters {
  niches: string[];
  /** Prefecture names, e.g. "Tokyo". */
  locations: string[];
  languages: string[];
  platforms: SocialPlatform[];
  services: string[];
  price: PriceRangeId | null;
  followers: FollowerRangeId | null;
  availableOnly: boolean;
}

export type SortOption = "recommended" | "recently-active" | "followers";

/** Option lists for the multi-select filters (later: Supabase lookup tables). */
export interface DiscoveryFilterOptions {
  niches: string[];
  locations: string[];
  languages: string[];
  services: string[];
}
