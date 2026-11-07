import type { Creator, Gender } from "@/types/creator";
import type {
  DiscoveryFilters,
  FilterKey,
  FollowerRangeId,
  SortOption,
} from "@/types/discovery";
import type { NumberRange } from "@/types/discovery";
import {
  FOLLOWER_RANGES,
  PLATFORM_LABELS,
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
    ...creator.languages.map((language) => language.name),
    ...creator.services.map((service) => service.name),
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

/** Inclusive on both ends; a `null` max means "no upper limit". */
const withinSlider = (value: number, range: NumberRange) =>
  value >= range.min && (range.max === null || value <= range.max);

const dollars = (n: number) => `$${n.toLocaleString("en-US")}`;

const describeRange = (range: NumberRange, format: (n: number) => string) =>
  range.max === null
    ? `${format(range.min)}+`
    : `${format(range.min)} – ${format(range.max)}`;

export function matchesFilters(creator: Creator, filters: DiscoveryFilters): boolean {
  if (!includesAny(creator.niches, filters.niches)) return false;
  if (!includesAny(creator.prefecture ? [creator.prefecture] : [], filters.locations)) return false;
  if (
    !includesAny(
      creator.languages.map((l) => l.name),
      filters.languages,
    )
  )
    return false;
  if (
    !includesAny(
      creator.socialAccounts.map((a) => a.platform),
      filters.platforms,
    )
  )
    return false;
  if (
    !includesAny(
      creator.services.map((s) => s.name),
      filters.services,
    )
  )
    return false;
  if (filters.availableOnly && !creator.isAvailable) return false;

  if (filters.price) {
    const lowest = getLowestRate(creator.services);
    if (lowest === null || !withinSlider(lowest, filters.price)) return false;
  }

  if (filters.age) {
    // Creators who have not shared an age are hidden while the age filter is on.
    if (creator.age == null || !withinSlider(creator.age, filters.age)) return false;
  }

  if (filters.genders.length > 0) {
    if (!creator.gender || !filters.genders.includes(creator.gender)) return false;
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
        (getLargestAudience(b.socialAccounts) ?? -1) - (getLargestAudience(a.socialAccounts) ?? -1),
    );
  }
  // "recommended" / "recently-active": keep the order the data arrives in.
  return creators;
}

export function countActiveFilters(
  filters: DiscoveryFilters,
  labels: DiscoveryLabels,
  keys?: FilterKey[],
): number {
  return getActiveFilterChips(filters, labels).filter((chip) => !keys || keys.includes(chip.key)).length;
}

/** The words used on filter chips, already translated (see useDiscoveryLabels). */
export interface DiscoveryLabels {
  filter: Record<FilterKey, string>;
  gender: Record<Gender, string>;
  follower: Record<FollowerRangeId, string>;
  availableNow: string;
  /** Translates a prefecture name ("Tokyo") for location chips. */
  prefecture: (name: string) => string;
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
export function getActiveFilterChips(
  filters: DiscoveryFilters,
  labels: DiscoveryLabels,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  const multi = (key: "niches" | "locations" | "languages" | "services") =>
    filters[key].forEach((value) =>
      chips.push({
        id: `${key}:${value}`,
        key,
        value,
        label: key === "locations" ? labels.prefecture(value) : value,
      }),
    );

  multi("niches");
  filters.platforms.forEach((value) =>
    chips.push({
      id: `platforms:${value}`,
      key: "platforms",
      value,
      label: PLATFORM_LABELS[value],
    }),
  );
  multi("services");
  multi("locations");
  multi("languages");

  if (filters.price) {
    const label = describeRange(filters.price, dollars);
    chips.push({ id: "price", key: "price", label: `${labels.filter.price}: ${label}` });
  }
  if (filters.age) {
    const label = describeRange(filters.age, String);
    chips.push({ id: "age", key: "age", label: `${labels.filter.age}: ${label}` });
  }
  filters.genders.forEach((value) =>
    chips.push({ id: `gender:${value}`, key: "gender", value, label: labels.gender[value] }),
  );
  if (filters.followers) {
    const label = labels.follower[filters.followers];
    chips.push({
      id: "followers",
      key: "followers",
      label: `${labels.filter.followers}: ${label}`,
    });
  }
  if (filters.availableOnly) {
    chips.push({ id: "availability", key: "availability", label: labels.availableNow });
  }
  return chips;
}
