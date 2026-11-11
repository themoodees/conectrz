import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import Link from "next/link";
import { SavedCreators } from "@/components/creator/SavedCreators";
import { buttonClass } from "@/components/ui/buttonStyles";
import { BookmarkIcon } from "@/components/ui/icons";
import { Pagination } from "@/components/ui/Pagination";
import { getCreatorsByIds } from "@/lib/data/creators";
import { getSavedCreatorIds } from "@/lib/data/saved";
import { PAGE_SIZE, paginate, parsePage } from "@/lib/pagination";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.savedPage");
  return { title: t("title") };
}

export default async function SavedPage({ searchParams }: PageProps<"/saved">) {
  const t = await getTranslations("app.savedPage");
  const [savedIds, { page: pageParam }] = await Promise.all([getSavedCreatorIds(), searchParams]);
  // Only the creators on this page are loaded.
  const paged = paginate(savedIds, parsePage(pageParam), PAGE_SIZE.saved);
  const creators = await getCreatorsByIds(paged.items);

  return (
    <PageContainer>
      <header className="pt-7 pb-6 md:pt-10 md:pb-7">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-muted">
          {t("description")}
        </p>
      </header>

      {savedIds.length > 0 ? (
        <>
          <SavedCreators creators={creators} total={paged.total} />
          <Pagination
            page={paged.page}
            totalPages={paged.totalPages}
            hrefFor={(n) => `/saved?page=${n}`}
          />
        </>
      ) : (
        <div className="flex flex-col items-center rounded-card border border-dashed border-border px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
            <BookmarkIcon className="size-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">{t("emptyTitle")}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {t("emptyText")}
          </p>
          <Link href="/discover" className={buttonClass({ className: "mt-5" })}>
            {t("discover")}
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
