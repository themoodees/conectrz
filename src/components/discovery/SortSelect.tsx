import type { SortOption } from "@/types/discovery";
import { SORT_OPTIONS } from "@/lib/discovery/filterConfig";
import { ChevronDownIcon } from "@/components/ui/icons";

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

/** Native select for accessibility and a good mobile picker. */
export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">Sort by</span>
      <span className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as SortOption)}
          aria-label="Sort creators"
          className="h-9 appearance-none rounded-control border border-border bg-white pr-9 pl-3 font-medium text-ink transition-colors hover:border-muted/50"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
      </span>
    </label>
  );
}
