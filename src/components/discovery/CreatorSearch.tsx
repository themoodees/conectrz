import { CloseIcon, SearchIcon } from "@/components/ui/icons";

interface CreatorSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CreatorSearch({
  value,
  onChange,
  placeholder = "Search creators",
}: CreatorSearchProps) {
  return (
    <div className="relative flex-1">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search creators by name, username or profile"
        className="h-12 w-full rounded-control border border-border bg-white pr-11 pl-12 text-base text-ink transition-colors placeholder:text-muted hover:border-muted/50 focus:border-primary focus:outline-none focus-visible:outline-none focus:ring-3 focus:ring-primary/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
