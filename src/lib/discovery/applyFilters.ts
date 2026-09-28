import type { Creator } from "@/types/creator";
import type { DiscoveryFilters, FilterKey, SortOption } from "@/types/discovery";
import {
  FILTER_LABELS,
  FOLLOWER_RANGES,
  PLATFORM_LABELS,
  PRICE_RANGES,
} from "./filterConfig";
import { getLargestAudience, getLowestRate } from "@/lib/format";

/*
 * Local (mock) search, filter and sort.
 * Within one filter, options match ANY selected value; different filters combine.
 * When Supabase is connected this moves into the query.
 */

export function matchesSearch(creator: Creator, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    creator.displayName,
    creator.bio ?? "",
    creator.city ?? "",
    creator.prefecture ?? "",
    ...creator.niches,
    ...creator.socialAccounts.map((account) => account.handle),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q.replace(/^@/, ""));
}

const includesAny = (values: string[], selected: string[]) =>
  selected.length === 0 || selected.some((value) => values.includes(value));

function inRange(value: number, range: { min: number; max: number | null }) {
  return value >= range.min && (range.max === null || value < range.max);
}

export function matchesFilters(creator: Creator, filters: DiscoveryFilters): boolean {
  if (!includesAny(creator.niches, filters.niches)) return false;
  if (!includesAny(creator.prefecture ? [creator.prefecture] : [], filters.locations))
    return false;
  if (!includesAny(creator.languages.map((l) => l.name), filters.languages)) return false;
  if (!includesAny(creator.socialAccounts.map((a) => a.platform), filters.platforms))
    return false;
  if (!includesAny(creator.services.map((s) => s.name), filters.services)) return false;
  if (filters.availableOnly && !creator.isAvailable) return false;

  if (filters.price) {
    const range = PRICE_RANGES.find((r) => r.id === filters.price)!;
    const lowest = getLowestRate(creator.services);
    if (lowest === null || !inRange(lowest, range)) return false;
  }

  if (filters.followers) {
    const range = FOLLOWER_RANGES.find((r) => r.id === filters.followers)!;
    const audience = getLargestAudience(creator.socialAccounts);
    if (audience === null || !inRange(audience, range)) return false;
  }

  return true;
}

export function sortCreators(creators: Creator[], sort: SortOption): Creator[] {
  if (sort === "followers") {
    return [...creators].sort(
      (a, b) =>
        (getLargestAudience(b.socialAccounts) ?? -1) -
        (getLargestAudience(a.socialAccounts) ?? -1),
    );
  }
  // "recommended" / "recently-active": keep the order the data arrives in.
  return creators;
}

export function countActiveFilters(filters: DiscoveryFilters, keys?: FilterKey[]): number {
  return getActiveFilterChips(filters).filter((chip) => !keys || keys.includes(chip.key))
    .length;
}

export interface ActiveFilterChip {
  /** Unique id for React keys. */
  id: string;
  key: FilterKey;
  label: string;
  /** For multi-select filters: the value to remove. */
  value?: string;
}

/** Flattens the filter state into one removable chip per selection. */
export function getActiveFilterChips(filters: DiscoveryFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  const multi = (key: "niches" | "locations" | "languages" | "services") =>
    filters[key].forEach((value) =>
      chips.push({ id: `${key}:${value}`, key, value, label: value }),
    );

  multi("niches");
  filters.platforms.forEach((value) =>
    chips.push({ id: `platforms:${value}`, key: "platforms", value, label: PLATFORM_LABELS[value] }),
  );
  multi("services");
  multi("locations");
  multi("languages");

  if (filters.price) {
    const label = PRICE_RANGES.find((r) => r.id === filters.price)?.label;
    chips.push({ id: "price", key: "price", label: `${FILTER_LABELS.price}: ${label}` });
  }
  if (filters.followers) {
    const label = FOLLOWER_RANGES.find((r) => r.id === filters.followers)?.label;
    chips.push({ id: "followers", key: "followers", label: `${FILTER_LABELS.followers}: ${label}` });
  }
  if (filters.availableOnly) {
    chips.push({ id: "availability", key: "availability", label: "Available now" });
  }
  return chips;
}
