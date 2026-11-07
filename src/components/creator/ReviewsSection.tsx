import { useLocale, useTranslations } from "next-intl";
import { formatDeadline } from "@/lib/format";
import { StarIcon } from "@/components/ui/icons";
import { RatingSummary } from "./RatingSummary";

export interface ReviewItem {
  id: string;
  /** Who wrote it. */
  name: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

/** Rating summary and visible reviews. `form` is the review form for people allowed to write one. */
export function ReviewsSection({
  reviews,
  form,
}: {
  reviews: ReviewItem[];
  form?: React.ReactNode;
}) {
  const t = useTranslations("app.reviews");
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : null;

  return (
    <section className="mt-14" aria-labelledby="reviews-heading">
      <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 id="reviews-heading" className="text-2xl font-semibold text-ink">
          {t("title")}
        </h2>
        <RatingSummary average={average} count={count} />
      </div>

      {form && <div className="mb-6 max-w-2xl">{form}</div>}

      <ReviewList reviews={reviews} />
    </section>
  );
}

/** The reviews themselves, newest first (empty state included). */
export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  const t = useTranslations("app.reviews");
  const locale = useLocale();
  if (reviews.length === 0) return <p className="text-sm text-muted">{t("none")}</p>;
  return (
    <ul className="max-w-2xl divide-y divide-border rounded-card border border-border">
      {reviews.map((review) => (
        <li key={review.id} className="p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-ink">{review.name}</p>
            <p className="text-xs text-muted">
              {formatDeadline(review.createdAt.slice(0, 10), locale)}
            </p>
          </div>
          <p
            className="mt-1 flex gap-0.5"
            role="img"
            aria-label={t("stars", { count: review.rating })}
          >
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
  );
}
