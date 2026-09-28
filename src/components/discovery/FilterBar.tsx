import type { DiscoveryFilterOptions, DiscoveryFilters } from "@/types/discovery";
import { countActiveFilters } from "@/lib/discovery/applyFilters";
import { FILTER_LABELS, PRIMARY_FILTERS, SECONDARY_FILTERS } from "@/lib/discovery/filterConfig";
import { SlidersIcon } from "@/components/ui/icons";
import { FilterDropdown } from "./FilterDropdown";
import { FilterSection } from "./FilterSection";
import type { FilterActions } from "./useDiscoveryFilters";

interface FilterBarProps {
  filters: DiscoveryFilters;
  actions: FilterActions;
  options: DiscoveryFilterOptions;
  onOpenMoreFilters: () => void;
}

/** Desktop/tablet toolbar: primary filter dropdowns + "More filters". Hidden on phones. */
export function FilterBar({ filters, actions, options, onOpenMoreFilters }: FilterBarProps) {
  const secondaryCount = countActiveFilters(filters, SECONDARY_FILTERS);

  return (
    <div className="hidden flex-wrap items-center gap-2 md:flex">
      {PRIMARY_FILTERS.map((key) => (
        <FilterDropdown
          key={key}
          label={FILTER_LABELS[key]}
          selectedCount={countActiveFilters(filters, [key])}
          onClear={() => actions.clear([key])}
        >
          <FilterSection
            filterKey={key}
            filters={filters}
            actions={actions}
            options={options}
            showTitle={false}
          />
        </FilterDropdown>
      ))}

      <MoreFiltersButton count={secondaryCount} onClick={onOpenMoreFilters} label="More filters" />
    </div>
  );
}

/** Opens the filter panel. Used as "More filters" (desktop) and "Filters" (mobile). */
export function MoreFiltersButton({
  count,
  onClick,
  label,
  className = "",
}: {
  count: number;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-control border border-border bg-white px-3.5 text-sm font-medium text-graphite transition-colors hover:border-muted/50 hover:text-ink ${className || "h-10"}`}
    >
      <SlidersIcon className="size-4" />
      {label}
      {count > 0 && (
        <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
