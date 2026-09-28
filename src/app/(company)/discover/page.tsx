import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { CreatorDiscovery } from "@/components/discovery/CreatorDiscovery";
import {
  getDiscoverableCreators,
  getDiscoveryFilterOptions,
} from "@/lib/data/creators";
import { getSavedCreatorIds } from "@/lib/data/saved";

export const metadata: Metadata = { title: "Discover creators" };

/* Page copy — edit freely. */
const COPY = {
  title: "Find the right creator for your brand",
  description:
    "Discover creators by niche, location, language, platform, services and more.",
};

export default async function DiscoverPage() {
  const [creators, filterOptions, savedIds] = await Promise.all([
    getDiscoverableCreators(),
    getDiscoveryFilterOptions(),
    getSavedCreatorIds(),
  ]);

  return (
    <PageContainer>
      <header className="pt-7 pb-6 md:pt-10 md:pb-7">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          {COPY.title}
        </h1>
        <p className="mt-2 text-base text-muted">{COPY.description}</p>
      </header>

      <CreatorDiscovery
        creators={creators}
        filterOptions={filterOptions}
        initialSavedIds={savedIds}
      />
    </PageContainer>
  );
}
