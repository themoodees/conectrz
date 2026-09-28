import type { DiscoveryFilterOptions, DiscoveryFilters, FilterKey } from "@/types/discovery";
import {
  FILTER_LABELS,
  FOLLOWER_RANGES,
  PRICE_RANGES,
  getFilterOptions,
  isMultiSelectFilter,
} from "@/lib/discovery/filterConfig";
import { OptionButton } from "./OptionButton";
import type { FilterActions } from "./useDiscoveryFilters";

interface FilterSectionProps {
  filterKey: FilterKey;
  filters: DiscoveryFilters;
  actions: FilterActions;
  options: DiscoveryFilterOptions;
  /** Show the filter name as a heading (used in the panel, hidden in dropdowns). */
  showTitle?: boolean;
}

const HINTS: Partial<Record<FilterKey, string>> = {
  price: "Based on the creator's lowest listed rate.",
  followers: "Largest audience on any platform. Creators without follower data are hidden.",
};

/** The controls for one filter. Shared by desktop dropdowns and the filter panel. */
export function FilterSection({
  filterKey,
  filters,
  actions,
  options,
  showTitle = true,
}: FilterSectionProps) {
  const hint = HINTS[filterKey];

  function renderControls() {
    if (isMultiSelectFilter(filterKey)) {
      const selected = filters[filterKey] as string[];
      return getFilterOptions(filterKey, options).map((option) => (
        <OptionButton
          key={option.value}
          label={option.label}
          isSelected={selected.includes(option.value)}
          onClick={() => actions.toggleValue(filterKey, option.value)}
        />
      ));
    }

    if (filterKey === "price") {
      return PRICE_RANGES.map((range) => (
        <OptionButton
          key={range.id}
          label={range.label}
          isSelected={filters.price === range.id}
          onClick={() => actions.setPrice(filters.price === range.id ? null : range.id)}
        />
      ));
    }

    if (filterKey === "followers") {
      return FOLLOWER_RANGES.map((range) => (
        <OptionButton
          key={range.id}
          label={range.label}
          isSelected={filters.followers === range.id}
          onClick={() =>
            actions.setFollowers(filters.followers === range.id ? null : range.id)
          }
        />
      ));
    }

    return (
      <OptionButton
        label="Available now"
        isSelected={filters.availableOnly}
        onClick={() => actions.setAvailableOnly(!filters.availableOnly)}
      />
    );
  }

  return (
    <fieldset>
      <legend className={showTitle ? "mb-3 text-sm font-semibold text-ink" : "sr-only"}>
        {FILTER_LABELS[filterKey]}
      </legend>
      {hint && <p className="-mt-1.5 mb-3 text-xs text-muted">{hint}</p>}
      <div className="flex flex-wrap gap-2">{renderControls()}</div>
    </fieldset>
  );
}
