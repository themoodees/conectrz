import { useTranslations } from "next-intl";
import { CloseIcon } from "@/components/ui/icons";

/** A selected filter shown above the results. Click to remove. */
export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const t = useTranslations("app.filters");
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={t("removeFilter", { label })}
      className="flex h-8 items-center gap-1.5 rounded-lg bg-primary-light pr-2 pl-3 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
    >
      {label}
      <CloseIcon className="size-3.5" />
    </button>
  );
}
