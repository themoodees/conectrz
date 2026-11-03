import type { CreatorProfile } from "@/types/creator";
import { formatDeadline } from "@/lib/format";
import { StarIcon } from "@/components/ui/icons";
import { RatingSummary } from "./RatingSummary";

/** Rating summary and visible reviews. `form` is the company-only review form. */
export function ReviewsSection({
  reviews,
  form,
}: {
  reviews: CreatorProfile["reviews"];
  form?: React.ReactNode;
}) {
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : null;

  return (
    <section className="mt-14" aria-labelledby="reviews-heading">
      <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 id="reviews-heading" className="text-2xl font-semibold text-ink">
          Reviews
        </h2>
        <RatingSummary average={average} count={count} />
      </div>

      {form && <div className="mb-6 max-w-2xl">{form}</div>}

      {count === 0 ? (
        <p className="text-sm text-muted">No reviews yet.</p>
      ) : (
        <ul className="max-w-2xl divide-y divide-border rounded-card border border-border">
          {reviews.map((review) => (
            <li key={review.id} className="p-4 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-ink">{review.companyName}</p>
                <p className="text-xs text-muted">{formatDeadline(review.createdAt.slice(0, 10))}</p>
              </div>
              <p className="mt-1 flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon
                    key={n}
                    filled={n <= review.rating}
                    className={`size-4 ${n <= review.rating ? "text-amber-500" : "text-border"}`}
                  />
                ))}
              </p>
              {review.comment && (
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-graphite">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
