import { StarIcon } from "@/components/ui/icons";

/** "★ 4.5 (12)" — nothing when a creator has no reviews yet. */
export function RatingSummary({
  average,
  count,
  className = "",
}: {
  average: number | null | undefined;
  count: number | undefined;
  className?: string;
}) {
  if (!count || average == null) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-sm ${className}`}>
      <StarIcon filled className="size-3.5 text-amber-500" />
      <span className="font-semibold text-ink">{average.toFixed(1)}</span>
      <span className="text-muted">({count})</span>
      <span className="sr-only">
        average rating from {count} {count === 1 ? "review" : "reviews"}
      </span>
    </span>
  );
}
