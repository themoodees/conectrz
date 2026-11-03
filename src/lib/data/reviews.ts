import "server-only";
import type { CreatorReview } from "@/types/creator";
import { isMockMode } from "@/lib/config";
import { mockStore } from "@/mocks/store";
import { mockCompanyAccount } from "@/mocks/account";
import { getSupabaseSession } from "./session";

/** Visible reviews of one creator, newest first. */
export async function getCreatorReviews(creatorId: string): Promise<CreatorReview[]> {
  if (isMockMode) {
    return mockStore.reviews
      .filter((r) => r.creatorId === creatorId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        companyName: r.companyName,
        createdAt: r.createdAt,
        isMine: r.companyId === mockCompanyAccount.id,
      }));
  }

  const { supabase } = await getSupabaseSession();
  const { data, error } = await supabase
    .from("creator_reviews_public")
    .select("id, rating, comment, company_name, created_at, is_mine")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.flatMap((r) =>
    r.id && r.rating !== null
      ? [
          {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            companyName: r.company_name ?? "A company",
            createdAt: r.created_at ?? "",
            isMine: r.is_mine ?? false,
          },
        ]
      : [],
  );
}
