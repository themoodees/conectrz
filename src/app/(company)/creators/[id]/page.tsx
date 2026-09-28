import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CreatorProfileView } from "@/components/creator/CreatorProfileView";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getCreatorProfile } from "@/lib/data/creators";
import { getConversationIdWithCreator } from "@/lib/data/messages";
import { getSavedCreatorIds } from "@/lib/data/saved";

export async function generateMetadata({
  params,
}: PageProps<"/creators/[id]">): Promise<Metadata> {
  const { id } = await params;
  const creator = await getCreatorProfile(id);
  return { title: creator?.displayName ?? "Creator" };
}

export default async function CreatorProfilePage({ params }: PageProps<"/creators/[id]">) {
  const { id } = await params;
  const [creator, savedIds, conversationId] = await Promise.all([
    getCreatorProfile(id),
    getSavedCreatorIds(),
    getConversationIdWithCreator(id),
  ]);
  if (!creator) notFound();

  return (
    <PageContainer>
      <Link
        href="/discover"
        className="mt-6 mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-graphite hover:text-ink md:mt-8"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Discover
      </Link>

      <CreatorProfileView
        creator={creator}
        isSaved={savedIds.includes(creator.id)}
        conversationId={conversationId}
      />
    </PageContainer>
  );
}
