/**
 * Niches, languages and services keep their English name in `name` and other languages in
 * `name_i18n` (e.g. {"ja": "美容"}). The site shows the reader's language and falls back to
 * English when a translation is missing, so a newly added category still appears everywhere.
 */
export interface NamedRow {
  name: string;
  name_i18n?: unknown;
}

export function localizedName(row: NamedRow, locale: string): string {
  const translations = row.name_i18n;
  if (translations && typeof translations === "object" && !Array.isArray(translations)) {
    const value = (translations as Record<string, unknown>)[locale];
    if (typeof value === "string" && value.trim()) return value;
  }
  return row.name;
}
