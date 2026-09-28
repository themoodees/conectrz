import { SearchIcon } from "@/components/ui/icons";

export function EmptyResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-border px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
        <SearchIcon className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-ink">No creators match your search</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Try removing a filter or searching for something broader.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 h-10 rounded-control border border-border px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface"
      >
        Reset search and filters
      </button>
    </div>
  );
}
