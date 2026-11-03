import "server-only";
import type { CompanyPublicProfile, CompanyReview } from "@/types/company";
import type { CreatorProject } from "@/types/projects";
import { isMockMode } from "@/lib/config";
import { MOCK_CREATOR_ID, mockCompanyAccount } from "@/mocks/account";
import { mockProjects } from "@/mocks/projects";
import { mockStore } from "@/mocks/store";
import { getSupabaseSession } from "./session";
import { getCreatorProjects } from "./projects";

/*
 * A brand's page for creators: rating, reviews and open projects.
 * Reads go through the `company_public_profiles` and `company_reviews_public` views, which
 * only creators, the brand itself and admins can read.
 */

export interface CompanyPage {
  company: CompanyPublicProfile;
  reviews: CompanyReview[];
  openProjects: CreatorProject[];
  /** The creator has talked with this brand (or already reviewed it), so they can review it. */
  canReview: boolean;
}

export async function getCompanyPage(id: string): Promise<CompanyPage | null> {
  if (isMockMode) {
    const known = mockStore.companies.find((c) => c.id === id);
    const fromProject = mockProjects.find((p) => p.companyId === id);
    const name = known?.name ?? fromProject?.companyName;
    if (!name) return null;
    const reviews = mockStore.companyReviews
      .filter((r) => r.companyId === id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const average = reviews.length
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : null;
    return {
      company: {
        id,
        name,
        joinedAt: known?.createdAt ?? "2026-09-01T00:00:00Z",
        ratingAverage: average,
        reviewCount: reviews.length,
      },
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        creatorName: r.creatorName,
        createdAt: r.createdAt,
        isMine: r.creatorId === MOCK_CREATOR_ID,
      })),
      openProjects: (await getCreatorProjects()).filter(
        (p) => p.companyId === id && p.status === "open",
      ),
      canReview: mockStore.conversations.some((c) => c.creatorId === MOCK_CREATOR_ID),
    };
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return null;

  const [profile, reviews, talked, projects] = await Promise.all([
    supabase
      .from("company_public_profiles")
      .select("id, name, created_at, rating_avg, review_count")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("company_reviews_public")
      .select("id, rating, comment, creator_name, created_at, is_mine")
      .eq("company_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", user.id)
      .eq("company_id", id),
    getCreatorProjects(),
  ]);
  if (profile.error) throw profile.error;
  if (reviews.error) throw reviews.error;
  if (!profile.data?.id || !profile.data.name) return null;

  const items: CompanyReview[] = reviews.data.flatMap((r) =>
    r.id && r.rating !== null
      ? [
          {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            creatorName: r.creator_name ?? "A creator",
            createdAt: r.created_at ?? "",
            isMine: r.is_mine ?? false,
          },
        ]
      : [],
  );

  return {
    company: {
      id: profile.data.id,
      name: profile.data.name,
      joinedAt: profile.data.created_at ?? "",
      ratingAverage: profile.data.rating_avg,
      reviewCount: profile.data.review_count ?? 0,
    },
    reviews: items,
    openProjects: projects.filter((p) => p.companyId === id && p.status === "open"),
    canReview: (talked.count ?? 0) > 0 || items.some((r) => r.isMine),
  };
}

/** What creators wrote about the signed-in company, newest first. */
export async function getMyCompanyReviews(): Promise<CompanyReview[]> {
  if (isMockMode) {
    return mockStore.companyReviews
      .filter((r) => r.companyId === mockCompanyAccount.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        creatorName: r.creatorName,
        createdAt: r.createdAt,
        isMine: false,
      }));
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return [];
  const { data, error } = await supabase
    .from("company_reviews_public")
    .select("id, rating, comment, creator_name, created_at")
    .eq("company_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.flatMap((r) =>
    r.id && r.rating !== null
      ? [
          {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            creatorName: r.creator_name ?? "A creator",
            createdAt: r.created_at ?? "",
            isMine: false,
          },
        ]
      : [],
  );
}
