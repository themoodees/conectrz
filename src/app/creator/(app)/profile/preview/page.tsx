import type { Metadata } from "next";
import Link from "next/link";
import { CreatorProfileView } from "@/components/creator/CreatorProfileView";
import { PageContainer } from "@/components/layout/PageContainer";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getOwnCreatorSummary } from "@/lib/data/creatorAccount";
import { getCreatorProfile } from "@/lib/data/creators";

export const metadata: Metadata = { title: "Profile preview" };

/** The creator's profile exactly as companies see it (without company actions). */
export default async function CreatorProfilePreviewPage() {
  const summary = await getOwnCreatorSummary();
  const creator = summary ? await getCreatorProfile(summary.id, false) : null;
  if (!creator) return null;

  return (
    <PageContainer>
      <div className="mt-6 mb-6 flex flex-wrap items-center justify-between gap-3 md:mt-8">
        <Link
          href="/creator/profile"
          className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-graphite hover:text-ink"
        >
          <ArrowLeftIcon className="size-4" />
          Back to editing
        </Link>
        <p className="rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-graphite">
          Preview — this is how brands see your profile
        </p>
      </div>
      <CreatorProfileView creator={creator} />
    </PageContainer>
  );
}
