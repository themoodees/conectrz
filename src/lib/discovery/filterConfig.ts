import type { Gender, SocialPlatform } from "@/types/creator";
import type {
  DiscoveryFilterOptions,
  DiscoveryFilters,
  FilterKey,
  FollowerRangeId,
  MultiSelectFilterKey,
  SortOption,
} from "@/types/discovery";

/*
 * Creator Discovery filter configuration — ranges and layout. Filter names are in the
 * translations (app.discovery). Edit here to change ranges, or move a filter between the
 * visible toolbar and the "More filters" panel.
 */

/** Shown directly in the desktop toolbar. */
export const PRIMARY_FILTERS: FilterKey[] = ["niches", "platforms", "services", "locations"];

/** Shown inside "More filters" on desktop. (Mobile shows all filters in one panel.) */
export const SECONDARY_FILTERS: FilterKey[] = [
  "languages",
  "price",
  "age",
  "gender",
  "followers",
  "availability",
];

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
};

export const PLATFORM_OPTIONS = Object.keys(PLATFORM_LABELS) as SocialPlatform[];

interface Range<Id extends string> {
  id: Id;
  min: number;
  /** Exclusive upper bound; `null` = no upper limit. */
  max: number | null;
}

/** Price slider. Matched against a creator's lowest listed rate; the top stop means "and above". */
export const PRICE_SLIDER = { min: 0, max: 3000, step: 50 };

/** Age slider (the top stop means "and above"). Creators must be 18 or older. */
export const AGE_SLIDER = { min: 18, max: 65, step: 1 };

export const GENDER_OPTIONS: Gender[] = ["woman", "man", "other"];

/** Matched against a creator's largest reported audience on any platform. */
export const FOLLOWER_RANGES: Range<FollowerRangeId>[] = [
  { id: "under-10k", min: 0, max: 10000 },
  { id: "10k-50k", min: 10000, max: 50000 },
  { id: "50k-100k", min: 50000, max: 100000 },
  { id: "100k-plus", min: 100000, max: null },
];

/** Labels live in the translations (app.discovery.sorts). */
export const SORT_OPTIONS: { value: SortOption; disabled?: boolean }[] = [
  { value: "recommended" },
  // No activity data exists yet, so this stays a visual placeholder.
  { value: "recently-active", disabled: true },
  { value: "followers" },
];

export const EMPTY_FILTERS: DiscoveryFilters = {
  niches: [],
  locations: [],
  languages: [],
  platforms: [],
  services: [],
  price: null,
  age: null,
  genders: [],
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
