"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState, useTransition } from "react";
import type { ReviewResult } from "@/lib/actions/reviews";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { StarIcon } from "@/components/ui/icons";

/**
 * A 1-5 star rating with an optional comment. Used by companies reviewing creators and by
 * creators reviewing brands: the page passes the matching save and delete actions.
 */
export function ReviewForm({
  existing,
  save,
  remove,
  placeholder,
}: {
  existing: { rating: number; comment: string | null } | null;
  save: (previous: ReviewResult, formData: FormData) => Promise<ReviewResult>;
  remove: () => Promise<ReviewResult>;
  placeholder?: string;
}) {
  const t = useTranslations("app.reviews");
  const [state, formAction, pending] = useActionState<ReviewResult, FormData>(save, {});
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [removing, startRemoving] = useTransition();

  return (
    <form action={formAction} className="space-y-4 rounded-card border border-border p-4 md:p-5">
      <h3 className="font-sans text-base font-semibold text-ink">
        {existing ? t("yourReview") : t("leave")}
      </h3>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {state.success && <FormMessage tone="success">{state.success}</FormMessage>}

      <fieldset>
        <legend className="sr-only">{t("rating")}</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                className="peer sr-only"
                required
              />
              <span className="sr-only">{t("starLabel", { count: n })}</span>
              <StarIcon
                filled={n <= rating}
                className={`size-8 peer-focus-visible:outline-2 peer-focus-visible:outline-primary ${
                  n <= rating ? "text-amber-500" : "text-border"
                }`}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-ink">
        {t("comment")}
        <textarea
          name="comment"
          rows={3}
          maxLength={1000}
          defaultValue={existing?.comment ?? ""}
          placeholder={placeholder ?? t("creatorPlaceholder")}
          className="mt-1.5 w-full rounded-control border border-border p-3 text-sm font-normal text-ink"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass()}>
          {pending ? t("saving") : existing ? t("update") : t("publish")}
        </button>
        {existing && (
          <button
            type="button"
            disabled={removing}
            onClick={() => startRemoving(async () => void (await remove()))}
            className={buttonClass({ variant: "ghost" })}
          >
            {removing ? t("deleting") : t("delete")}
          </button>
        )}
      </div>
    </form>
  );
}
