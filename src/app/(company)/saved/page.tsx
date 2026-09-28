import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import Link from "next/link";
import { SavedCreators } from "@/components/creator/SavedCreators";
import { buttonClass } from "@/components/ui/buttonStyles";
import { BookmarkIcon } from "@/components/ui/icons";
import { getSavedCreators } from "@/lib/data/saved";

export const metadata: Metadata = { title: "Saved creators" };

export default async function SavedPage() {
  const creators = await getSavedCreators();

  return (
    <PageContainer>
      <header className="pt-7 pb-6 md:pt-10 md:pb-7">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          Saved creators
        </h1>
        <p className="mt-2 text-base text-muted">
          Creators you&apos;ve saved from Discover, in one place.
        </p>
      </header>

      {creators.length > 0 ? (
        <SavedCreators creators={creators} />
      ) : (
        <div className="flex flex-col items-center rounded-card border border-dashed border-border px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
            <BookmarkIcon className="size-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">No saved creators yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Save creators while browsing to build a shortlist for your campaigns.
          </p>
          <Link href="/discover" className={buttonClass({ className: "mt-5" })}>
            Discover creators
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
