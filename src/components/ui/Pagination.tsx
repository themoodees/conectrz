import Link from "next/link";
import { useTranslations } from "next-intl";
import { pageNumbers } from "@/lib/pagination";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Server-rendered lists: the address of a page (the `?page=` link). */
  hrefFor?: (page: number) => string;
  /** Lists filtered in the browser: called when a page is chosen. */
  onChange?: (page: number) => void;
}

const base =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-control border px-3 text-sm font-medium";
const idle = `${base} border-border bg-white text-ink hover:border-muted/50`;
const current = `${base} border-ink bg-ink text-white`;
const disabled = `${base} cursor-not-allowed border-border bg-surface text-muted`;

/** Previous / page numbers / Next. Shows nothing when there is only one page. */
export function Pagination({ page, totalPages, hrefFor, onChange }: PaginationProps) {
  const t = useTranslations("app.pagination");
  if (totalPages <= 1) return null;

  const control = (target: number, className: string, content: React.ReactNode, label?: string) =>
    hrefFor ? (
      <Link href={hrefFor(target)} className={className} aria-label={label} scroll>
        {content}
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => onChange?.(target)}
        className={className}
        aria-label={label}
      >
        {content}
      </button>
    );

  return (
    <nav aria-label={t("label")} className="mt-8 flex items-center justify-center gap-2">
      {page > 1 ? (
        control(page - 1, idle, t("previous"))
      ) : (
        <span className={disabled}>{t("previous")}</span>
      )}

      {/* Phones: just the position. Larger screens: the page numbers. */}
      <span className="px-2 text-sm text-graphite sm:hidden">
        {t("pageOf", { page, total: totalPages })}
      </span>
      <div className="hidden items-center gap-2 sm:flex">
        {pageNumbers(page, totalPages).map((n, i) =>
          n === null ? (
            <span key={`gap-${i}`} className="px-1 text-muted" aria-hidden>
              …
            </span>
          ) : n === page ? (
            <span key={n} className={current} aria-current="page">
              {n}
            </span>
          ) : (
            <span key={n}>{control(n, idle, n, t("goTo", { page: n }))}</span>
          ),
        )}
      </div>

      {page < totalPages ? (
        control(page + 1, idle, t("next"))
      ) : (
        <span className={disabled}>{t("next")}</span>
      )}
    </nav>
  );
}
