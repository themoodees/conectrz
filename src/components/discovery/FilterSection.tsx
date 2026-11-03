import type { DiscoveryFilterOptions, DiscoveryFilters, FilterKey } from "@/types/discovery";
import {
  FILTER_LABELS,
  FOLLOWER_RANGES,
  AGE_SLIDER,
  GENDER_LABELS,
  GENDER_OPTIONS,
  PRICE_SLIDER,
  getFilterOptions,
  isMultiSelectFilter,
} from "@/lib/discovery/filterConfig";
import { OptionButton } from "./OptionButton";
import { RangeSlider } from "./RangeSlider";
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
  age: "Creators who have not shared their age are hidden while this is on.",
  gender: "Creators who have not shared their gender are hidden while this is on.",
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
      return (
        <RangeSlider
          label="Price"
          {...PRICE_SLIDER}
          value={filters.price}
          onChange={actions.setPrice}
          format={(n) => `$${n.toLocaleString("en-US")}`}
        />
      );
    }

    if (filterKey === "age") {
      return (
        <RangeSlider
          label="Age"
          {...AGE_SLIDER}
          value={filters.age}
          onChange={actions.setAge}
          format={String}
        />
      );
    }

    if (filterKey === "gender") {
      return GENDER_OPTIONS.map((gender) => (
        <OptionButton
          key={gender}
          label={GENDER_LABELS[gender]}
          isSelected={filters.genders.includes(gender)}
          onClick={() => actions.toggleGender(gender)}
        />
      ));
    }

    if (filterKey === "followers") {
      return FOLLOWER_RANGES.map((range) => (
        <OptionButton
          key={range.id}
          label={range.label}
          isSelected={filters.followers === range.id}
          onClick={() => actions.setFollowers(filters.followers === range.id ? null : range.id)}
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
