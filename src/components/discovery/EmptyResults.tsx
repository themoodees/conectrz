import { useTranslations } from "next-intl";
import { SearchIcon } from "@/components/ui/icons";

export function EmptyResults({ onReset }: { onReset: () => void }) {
  const t = useTranslations("app.discovery.empty");
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-border px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
        <SearchIcon className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-ink">{t("title")}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">
        {t("text")}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 h-10 rounded-control border border-border px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface"
      >
        {t("reset")}
      </button>
    </div>
  );
}
