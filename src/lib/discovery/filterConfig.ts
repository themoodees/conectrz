import type { SocialPlatform } from "@/types/creator";
import type {
  DiscoveryFilterOptions,
  DiscoveryFilters,
  FilterKey,
  FollowerRangeId,
  MultiSelectFilterKey,
  PriceRangeId,
  SortOption,
} from "@/types/discovery";

/*
 * Creator Discovery filter configuration — labels, ranges and layout.
 * Edit here to rename filters, change ranges, or move a filter between the
 * visible toolbar and the "More filters" panel.
 */

export const FILTER_LABELS: Record<FilterKey, string> = {
  niches: "Niche",
  locations: "Location",
  languages: "Language",
  platforms: "Platform",
  services: "Services",
  price: "Price",
  followers: "Followers",
  availability: "Availability",
};

/** Shown directly in the desktop toolbar. */
export const PRIMARY_FILTERS: FilterKey[] = ["niches", "platforms", "services", "locations"];

/** Shown inside "More filters" on desktop. (Mobile shows all filters in one panel.) */
export const SECONDARY_FILTERS: FilterKey[] = ["languages", "price", "followers", "availability"];

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
};

export const PLATFORM_OPTIONS = Object.keys(PLATFORM_LABELS) as SocialPlatform[];

interface Range<Id extends string> {
  id: Id;
  label: string;
  min: number;
  /** Exclusive upper bound; `null` = no upper limit. */
  max: number | null;
}

/** Matched against a creator's lowest listed rate. */
export const PRICE_RANGES: Range<PriceRangeId>[] = [
  { id: "under-30k", label: "Under ¥30,000", min: 0, max: 30000 },
  { id: "30k-80k", label: "¥30,000 – ¥80,000", min: 30000, max: 80000 },
  { id: "80k-150k", label: "¥80,000 – ¥150,000", min: 80000, max: 150000 },
  { id: "150k-plus", label: "¥150,000+", min: 150000, max: null },
];

/** Matched against a creator's largest reported audience on any platform. */
export const FOLLOWER_RANGES: Range<FollowerRangeId>[] = [
  { id: "under-10k", label: "Under 10K", min: 0, max: 10000 },
  { id: "10k-50k", label: "10K – 50K", min: 10000, max: 50000 },
  { id: "50k-100k", label: "50K – 100K", min: 50000, max: 100000 },
  { id: "100k-plus", label: "100K+", min: 100000, max: null },
];

export const SORT_OPTIONS: { value: SortOption; label: string; disabled?: boolean }[] = [
  { value: "recommended", label: "Recommended" },
  // No activity data exists yet, so this stays a visual placeholder.
  { value: "recently-active", label: "Recently active", disabled: true },
  { value: "followers", label: "Followers" },
];

export const EMPTY_FILTERS: DiscoveryFilters = {
  niches: [],
  locations: [],
  languages: [],
  platforms: [],
  services: [],
  price: null,
  followers: null,
  availableOnly: false,
};

export const MULTI_SELECT_FILTERS: MultiSelectFilterKey[] = [
  "niches",
  "locations",
  "languages",
  "platforms",
  "services",
];

export const isMultiSelectFilter = (key: FilterKey): key is MultiSelectFilterKey =>
  (MULTI_SELECT_FILTERS as FilterKey[]).includes(key);

/** Value/label pairs for a multi-select filter. */
export function getFilterOptions(
  key: MultiSelectFilterKey,
  options: DiscoveryFilterOptions,
): { value: string; label: string }[] {
  if (key === "platforms") {
    return PLATFORM_OPTIONS.map((value) => ({ value, label: PLATFORM_LABELS[value] }));
  }
  return options[key].map((value) => ({ value, label: value }));
}
