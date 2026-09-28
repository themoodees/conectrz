"use client";

import { useMemo, useState } from "react";
import type { Creator } from "@/types/creator";
import type { DiscoveryFilterOptions, FilterKey, SortOption } from "@/types/discovery";
import {
  getActiveFilterChips,
  matchesFilters,
  matchesSearch,
  sortCreators,
} from "@/lib/discovery/applyFilters";
import { PRIMARY_FILTERS, SECONDARY_FILTERS } from "@/lib/discovery/filterConfig";
import { ActiveFilters } from "./ActiveFilters";
import { CreatorGrid } from "./CreatorGrid";
import { CreatorSearch } from "./CreatorSearch";
import { EmptyResults } from "./EmptyResults";
import { FilterBar, MoreFiltersButton } from "./FilterBar";
import { FilterPanel } from "./FilterPanel";
import { FilterSection } from "./FilterSection";
import { SortSelect } from "./SortSelect";
import { useDiscoveryFilters } from "./useDiscoveryFilters";
import { useSavedCreators } from "@/components/creator/useSavedCreators";

const ALL_FILTERS: FilterKey[] = [...PRIMARY_FILTERS, ...SECONDARY_FILTERS];

interface CreatorDiscoveryProps {
  creators: Creator[];
  filterOptions: DiscoveryFilterOptions;
  initialSavedIds: string[];
}

/**
 * Creator Discovery: search, filters, sorting and results.
 * Search/filter/sort run in the browser over the loaded creators.
 * Saving is stored via useSavedCreators.
 */
export function CreatorDiscovery({
  creators,
  filterOptions,
  initialSavedIds,
}: CreatorDiscoveryProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("recommended");
  const { savedIds, toggleSave } = useSavedCreators(initialSavedIds);
  // "more" = desktop secondary filters, "all" = mobile full filter sheet
  const [panel, setPanel] = useState<"more" | "all" | null>(null);
  const { filters, actions } = useDiscoveryFilters();

  const results = useMemo(
    () =>
      sortCreators(
        creators.filter(
          (creator) => matchesSearch(creator, query) && matchesFilters(creator, filters),
        ),
        sort,
      ),
    [creators, query, filters, sort],
  );

  const chips = getActiveFilterChips(filters);
  const panelKeys = panel === "more" ? SECONDARY_FILTERS : ALL_FILTERS;
  const panelHasSelection = chips.some((chip) => panelKeys.includes(chip.key));

  const resetAll = () => {
    setQuery("");
    actions.clear();
  };

  return (
    <div className="space-y-5">
      {/* Search + filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <CreatorSearch value={query} onChange={setQuery} />
          <MoreFiltersButton
            label="Filters"
            count={chips.length}
            onClick={() => setPanel("all")}
            className="h-12 md:hidden"
          />
        </div>
        <FilterBar
          filters={filters}
          actions={actions}
          options={filterOptions}
          onOpenMoreFilters={() => setPanel("more")}
        />
      </div>

      <ActiveFilters chips={chips} onRemove={actions.removeChip} onClearAll={() => actions.clear()} />

      {/* Results */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-sm text-graphite" aria-live="polite">
          <span className="font-semibold text-ink">{results.length}</span>{" "}
          {results.length === 1 ? "creator" : "creators"}
        </p>
        <SortSelect value={sort} onChange={setSort} />
      </div>

      {results.length > 0 ? (
        <CreatorGrid creators={results} savedIds={savedIds} onToggleSave={toggleSave} />
      ) : (
        <EmptyResults onReset={resetAll} />
      )}

      <FilterPanel
        title={panel === "more" ? "More filters" : "Filters"}
        isOpen={panel !== null}
        onClose={() => setPanel(null)}
        onClear={() => actions.clear(panelKeys)}
        canClear={panelHasSelection}
        resultCount={results.length}
      >
        {panelKeys.map((key) => (
          <FilterSection
            key={key}
            filterKey={key}
            filters={filters}
            actions={actions}
            options={filterOptions}
          />
        ))}
      </FilterPanel>
    </div>
  );
}
