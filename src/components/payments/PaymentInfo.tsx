import { useTranslations } from "next-intl";
import type { PaymentMethod } from "@/lib/payments";

/** The methods as small tags; methods in `highlight` get a check mark. */
export function PaymentMethodTags({
  methods,
  highlight = [],
}: {
  methods: readonly PaymentMethod[];
  highlight?: readonly PaymentMethod[];
}) {
  const t = useTranslations("app.payments");
  if (methods.length === 0) return <span className="text-sm text-muted">{t("notSpecified")}</span>;
  return (
    <ul className="flex flex-wrap gap-2">
      {methods.map((method) => (
        <li
          key={method}
          className={`rounded-md px-2.5 py-1 text-sm font-medium ${
            highlight.includes(method)
              ? "bg-primary-light text-primary"
              : "bg-surface text-graphite"
          }`}
        >
          {highlight.includes(method) && <span aria-hidden="true">✓ </span>}
          {t(`methods.${method}`)}
        </li>
      ))}
    </ul>
  );
}

export function PaymentNotice({ className = "" }: { className?: string }) {
  const t = useTranslations("app.payments");
  return <p className={`text-xs text-muted ${className}`}>{t("notice")}</p>;
}
