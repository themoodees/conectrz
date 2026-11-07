import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CreatorProfileView } from "@/components/creator/CreatorProfileView";
import { ReviewForm } from "@/components/creator/ReviewForm";
import { deleteReview, saveReview } from "@/lib/actions/reviews";
import { ProfileActions } from "@/components/creator/ProfileActions";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getCreatorProfile } from "@/lib/data/creators";
import { getConversationIdWithCreator, getConversationUsage } from "@/lib/data/messages";
import { getSavedCreatorIds } from "@/lib/data/saved";
import { getPlans } from "@/lib/data/plans";

export async function generateMetadata({ params }: PageProps<"/creators/[id]">): Promise<Metadata> {
  const { id } = await params;
  const creator = await getCreatorProfile(id);
  const t = await getTranslations("app.discovery.profile");
  return { title: creator?.displayName ?? t("metaCreator") };
}

export default async function CreatorProfilePage({ params }: PageProps<"/creators/[id]">) {
  const { id } = await params;
  const t = await getTranslations("app.discovery.profile");
  const [creator, savedIds, conversationId, usage, plans] = await Promise.all([
    getCreatorProfile(id),
    getSavedCreatorIds(),
    getConversationIdWithCreator(id),
    getConversationUsage(),
    getPlans(),
  ]);
  // Paid plans offering more conversations than the current one.
  const upgradePlans = plans.filter(
    (plan) =>
      plan.monthlyPriceUsd > 0 &&
      usage?.quota !== null &&
      (plan.conversationQuota === null || plan.conversationQuota > (usage?.quota ?? 0)),
  );
  if (!creator) notFound();

  return (
    <PageContainer>
      <Link
        href="/discover"
        className="mt-6 mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-graphite hover:text-ink md:mt-8"
      >
        <ArrowLeftIcon className="size-4" />
        {t("back")}
      </Link>

      <CreatorProfileView
        creator={creator}
        reviewForm={
          conversationId || creator.reviews.some((r) => r.isMine) ? (
            <ReviewForm
              existing={creator.reviews.find((r) => r.isMine) ?? null}
              save={saveReview.bind(null, creator.id)}
              remove={deleteReview.bind(null, creator.id)}
            />
          ) : undefined
        }
        actions={
          <ProfileActions
            creatorId={creator.id}
            creatorName={creator.displayName}
            isSaved={savedIds.includes(creator.id)}
            conversationId={conversationId}
            usage={usage}
            upgradePlans={upgradePlans}
          />
        }
      />
    </PageContainer>
  );
}
