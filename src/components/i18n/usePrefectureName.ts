import { useTranslations } from "next-intl";

/** Translates a prefecture's English name ("Tokyo") into the site language. Unknown names pass through. */
export function usePrefectureName() {
  const t = useTranslations("app.prefectures");
  return (name: string) => (t.has(name) ? t(name) : name);
}
