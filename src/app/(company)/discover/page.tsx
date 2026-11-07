import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { CreatorDiscovery } from "@/components/discovery/CreatorDiscovery";
import { getDiscoverableCreators, getDiscoveryFilterOptions } from "@/lib/data/creators";
import { getSavedCreatorIds } from "@/lib/data/saved";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.discovery");
  return { title: t("metaTitle") };
}

export default async function DiscoverPage() {
  const t = await getTranslations("app.discovery");
  const [creators, filterOptions, savedIds] = await Promise.all([
    getDiscoverableCreators(),
    getDiscoveryFilterOptions(),
    getSavedCreatorIds(),
  ]);

  return (
    <PageContainer>
      <header className="pt-7 pb-6 md:pt-10 md:pb-7">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-muted">{t("description")}</p>
      </header>

      <CreatorDiscovery
        creators={creators}
        filterOptions={filterOptions}
        initialSavedIds={savedIds}
      />
    </PageContainer>
  );
}
