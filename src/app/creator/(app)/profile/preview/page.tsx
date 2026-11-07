import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CreatorProfileView } from "@/components/creator/CreatorProfileView";
import { PageContainer } from "@/components/layout/PageContainer";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getOwnCreatorSummary } from "@/lib/data/creatorAccount";
import { getCreatorProfile } from "@/lib/data/creators";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.profilePage");
  return { title: t("previewTitle") };
}

/** The creator's profile exactly as companies see it (without company actions). */
export default async function CreatorProfilePreviewPage() {
  const t = await getTranslations("app.profilePage");
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
          {t("back")}
        </Link>
        <p className="rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-graphite">
          {t("previewNote")}
        </p>
      </div>
      <CreatorProfileView creator={creator} />
    </PageContainer>
  );
}
