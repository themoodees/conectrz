"use server";

import { revalidatePath } from "next/cache";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";
import { MOCK_CREATOR_ID, mockCompanyAccount } from "@/mocks/account";
import { mockCreators } from "@/mocks/creators";
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

/* ── Creators reviewing brands ────────────────────────────────────────────── */

/**
 * Saves the signed-in creator's review of a brand (one per creator per brand).
 * The database only allows it when the creator has a conversation with that company.
 */
export async function saveCompanyReview(
  companyId: string,
  _previous: ReviewResult,
  formData: FormData,
): Promise<ReviewResult> {
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim().slice(0, MAX_COMMENT);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Choose a rating from 1 to 5 stars." };
  }

  if (isMockMode) {
    const me = mockCreators.find((c) => c.id === MOCK_CREATOR_ID);
    const existing = mockStore.companyReviews.find(
      (r) => r.companyId === companyId && r.creatorId === MOCK_CREATOR_ID,
    );
    if (existing) Object.assign(existing, { rating, comment: comment || null });
    else
      mockStore.companyReviews.push({
        id: `crv-${Date.now()}`,
        companyId,
        creatorId: MOCK_CREATOR_ID,
        creatorName: me?.displayName.split(" ")[0] ?? "Creator",
        rating,
        comment: comment || null,
        createdAt: new Date().toISOString(),
      });
    revalidatePath(`/creator/companies/${companyId}`);
    return { success: "Thanks, your review is published." };
  }

  if (!UUID.test(companyId)) return { error: "Invalid company." };
  const { supabase, user } = await requireSupabaseUser();
  const { error } = await supabase.from("company_reviews").upsert(
    { company_id: companyId, creator_id: user.id, rating, comment: comment || null },
    { onConflict: "company_id,creator_id" },
  );
  if (error) {
    return {
      error: "We couldn't save your review. You can only review companies you have talked to.",
    };
  }
  revalidatePath(`/creator/companies/${companyId}`);
  return { success: "Thanks, your review is published." };
}

/** Deletes the signed-in creator's own review of a brand. */
export async function deleteCompanyReview(companyId: string): Promise<ReviewResult> {
  if (isMockMode) {
    mockStore.companyReviews = mockStore.companyReviews.filter(
      (r) => !(r.companyId === companyId && r.creatorId === MOCK_CREATOR_ID),
    );
    revalidatePath(`/creator/companies/${companyId}`);
    return { success: "Review deleted." };
  }
  if (!UUID.test(companyId)) return { error: "Invalid company." };
  const { supabase, user } = await requireSupabaseUser();
  const { error } = await supabase
    .from("company_reviews")
    .delete()
    .eq("company_id", companyId)
    .eq("creator_id", user.id);
  if (error) return { error: "We couldn't delete your review." };
  revalidatePath(`/creator/companies/${companyId}`);
  return { success: "Review deleted." };
}
