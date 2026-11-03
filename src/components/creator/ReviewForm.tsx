"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteReview, saveReview, type ReviewResult } from "@/lib/actions/reviews";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { StarIcon } from "@/components/ui/icons";

/** A company rates a creator it has messaged (1-5 stars + optional comment). */
export function ReviewForm({
  creatorId,
  existing,
}: {
  creatorId: string;
  existing: { rating: number; comment: string | null } | null;
}) {
  const [state, formAction, pending] = useActionState<ReviewResult, FormData>(
    saveReview.bind(null, creatorId),
    {},
  );
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [removing, startRemoving] = useTransition();

  return (
    <form action={formAction} className="space-y-4 rounded-card border border-border p-4 md:p-5">
      <h3 className="font-sans text-base font-semibold text-ink">
        {existing ? "Your review" : "Leave a review"}
      </h3>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {state.success && <FormMessage tone="success">{state.success}</FormMessage>}

      <fieldset>
        <legend className="sr-only">Rating</legend>
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
              <span className="sr-only">
                {n} {n === 1 ? "star" : "stars"}
              </span>
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
        Comment (optional)
        <textarea
          name="comment"
          rows={3}
          maxLength={1000}
          defaultValue={existing?.comment ?? ""}
          placeholder="How was it to work with this creator?"
          className="mt-1.5 w-full rounded-control border border-border p-3 text-sm font-normal text-ink"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass()}>
          {pending ? "Saving…" : existing ? "Update review" : "Publish review"}
        </button>
        {existing && (
          <button
            type="button"
            disabled={removing}
            onClick={() => startRemoving(async () => void (await deleteReview(creatorId)))}
            className={buttonClass({ variant: "ghost" })}
          >
            {removing ? "Deleting…" : "Delete my review"}
          </button>
        )}
      </div>
    </form>
  );
}
