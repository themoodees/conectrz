"use server";

import { revalidatePath } from "next/cache";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";
import { mockCompanyAccount } from "@/mocks/account";
import { mockStore } from "@/mocks/store";

export interface ReviewResult {
  error?: string;
  success?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_COMMENT = 1000;

/**
 * Saves the signed-in company's review of a creator (one per company per creator).
 * The database only allows it when the company has a conversation with that creator.
 */
export async function saveReview(
  creatorId: string,
  _previous: ReviewResult,
  formData: FormData,
): Promise<ReviewResult> {
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim().slice(0, MAX_COMMENT);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Choose a rating from 1 to 5 stars." };
  }

  if (isMockMode) {
    const company = mockCompanyAccount;
    const existing = mockStore.reviews.find(
      (r) => r.creatorId === creatorId && r.companyId === company.id,
    );
    if (existing) Object.assign(existing, { rating, comment: comment || null });
    else
      mockStore.reviews.push({
        id: `rv-${Date.now()}`,
        creatorId,
        companyId: company.id,
        companyName: company.companyName,
        rating,
        comment: comment || null,
        createdAt: new Date().toISOString(),
      });
    revalidatePath(`/creators/${creatorId}`);
    return { success: "Thanks, your review is published." };
  }

  if (!UUID.test(creatorId)) return { error: "Invalid creator." };
  const { supabase, user } = await requireSupabaseUser();
  const { error } = await supabase.from("creator_reviews").upsert(
    {
      creator_id: creatorId,
      company_id: user.id,
      rating,
      comment: comment || null,
    },
    { onConflict: "creator_id,company_id" },
  );
  if (error) {
    return {
      error: "We couldn't save your review. You can only review creators you have messaged.",
    };
  }
  revalidatePath(`/creators/${creatorId}`);
  revalidatePath("/discover");
  return { success: "Thanks, your review is published." };
}

/** Deletes the signed-in company's own review. */
export async function deleteReview(creatorId: string): Promise<ReviewResult> {
  if (isMockMode) {
    mockStore.reviews = mockStore.reviews.filter(
      (r) => !(r.creatorId === creatorId && r.companyId === mockCompanyAccount.id),
    );
    revalidatePath(`/creators/${creatorId}`);
    return { success: "Review deleted." };
  }
  if (!UUID.test(creatorId)) return { error: "Invalid creator." };
  const { supabase, user } = await requireSupabaseUser();
  const { error } = await supabase
    .from("creator_reviews")
    .delete()
    .eq("creator_id", creatorId)
    .eq("company_id", user.id);
  if (error) return { error: "We couldn't delete your review." };
  revalidatePath(`/creators/${creatorId}`);
  revalidatePath("/discover");
  return { success: "Review deleted." };
}
