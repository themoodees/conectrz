"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { ENABLED_LOCALES, LOCALE_LABELS } from "@/i18n/config";
import { setLocale } from "@/lib/actions/locale";

/** Language picker. Shows each language in its own name; hidden while only one is enabled. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  if (ENABLED_LOCALES.length < 2) return null;

  return (
    <select
      aria-label="Language"
      value={locale}
      disabled={pending}
      onChange={(event) => startTransition(() => setLocale(event.target.value))}
      className={`rounded-control border border-border bg-white px-2.5 py-1.5 text-sm text-ink ${className}`}
    >
      {ENABLED_LOCALES.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code]}
        </option>
      ))}
    </select>
  );
}
