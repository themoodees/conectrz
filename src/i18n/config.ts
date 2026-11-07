/** Languages the site can show. English is the source language and the fallback. */
export const LOCALES = ["en", "ja", "pt", "es", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

/** Names shown in the language picker, each written in its own language. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  pt: "Português",
  es: "Español",
  fr: "Français",
};

/** Languages with a finished translation. Others stay hidden from the picker until ready. */
export const ENABLED_LOCALES: readonly Locale[] = ["en", "ja"];

export const isLocale = (value: string | undefined | null): value is Locale =>
  Boolean(value) && (LOCALES as readonly string[]).includes(value as string);

export const isEnabledLocale = (value: string | undefined | null): value is Locale =>
  isLocale(value) && ENABLED_LOCALES.includes(value);

/** Picks the best enabled language from an Accept-Language header ("ja,en-US;q=0.9,en;q=0.8"). */
export function pickFromAcceptLanguage(header: string | null | undefined): Locale {
  const ranked = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q);
  return ranked.map((x) => x.tag).find(isEnabledLocale) ?? DEFAULT_LOCALE;
}
