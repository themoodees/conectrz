import { useTranslations } from "next-intl";
import type { ActiveFilterChip } from "@/lib/discovery/applyFilters";
import { FilterChip } from "./FilterChip";

interface ActiveFiltersProps {
  chips: ActiveFilterChip[];
  onRemove: (chip: ActiveFilterChip) => void;
  onClearAll: () => void;
}

/** Row of removable chips for every selected filter, plus "Clear all". */
export function ActiveFilters({ chips, onRemove, onClearAll }: ActiveFiltersProps) {
  const t = useTranslations("app.discovery");
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={t("activeFilters")}>
      {chips.map((chip) => (
        <FilterChip key={chip.id} label={chip.label} onRemove={() => onRemove(chip)} />
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 h-8 rounded-lg px-2 text-sm font-medium text-graphite underline-offset-4 hover:text-ink hover:underline"
      >
        {t("clearAll")}
      </button>
    </div>
  );
}
