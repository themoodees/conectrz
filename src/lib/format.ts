import type { Creator, CreatorService, LanguageProficiency, SocialAccount } from "@/types/creator";

const compactCache = new Map<string, Intl.NumberFormat>();
const compactFor = (locale: string) => {
  let f = compactCache.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
    compactCache.set(locale, f);
  }
  return f;
};

// English formatting ("$250"). Whole dollars; cents are only used for storage.
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** 248000 → "248K" */
export const formatFollowers = (count: number, locale = "en") => compactFor(locale).format(count);

/** 250 → "$250" */
export const formatUsd = (amount: number) => usd.format(amount);

/** Database stores USD cents; the app works in dollars. */
export const centsToUsd = (cents: number) => cents / 100;
export const usdToCents = (dollars: number) => Math.round(dollars * 100);

/** "Shibuya, Tokyo" — falls back gracefully when parts are missing. */
export function formatLocation(
  creator: Pick<Creator, "city" | "prefecture" | "country">,
  translatePrefecture: (name: string) => string = (name) => name,
  locale = "en",
) {
  const prefecture = creator.prefecture ? translatePrefecture(creator.prefecture) : creator.prefecture;
  if (locale === "ja" && prefecture && creator.city) {
    // Japanese writes the place big to small without a separator: 東京都渋谷区.
    return creator.city.startsWith(prefecture) ? creator.city : `${prefecture}${creator.city}`;
  }
  const parts = [creator.city, prefecture].filter(
    (part, index, all): part is string => Boolean(part) && all.indexOf(part) === index,
  );
  return parts.length > 0 ? parts.join(", ") : creator.country;
}

export function getLowestRate(services: CreatorService[]): number | null {
  if (services.length === 0) return null;
  return Math.min(...services.map((service) => service.rateAmountUsd));
}

export function getLargestAudience(accounts: SocialAccount[]): number | null {
  const counts = accounts
    .map((account) => account.followerCount)
    .filter((count): count is number => count !== null);
  return counts.length > 0 ? Math.max(...counts) : null;
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const PROFICIENCY_ORDER: LanguageProficiency[] = ["native", "fluent", "conversational"];

/** English labels. UI uses `app.proficiency` in the message files. */
export const PROFICIENCY_LABELS: Record<LanguageProficiency, string> = {
  native: "Native",
  fluent: "Fluent",
  conversational: "Conversational",
};

/** "$250" for flat rates, "From $250" for starting-from rates. */
export function formatRate(
  service: CreatorService,
  t?: (key: "from", values: { amount: string }) => string,
) {
  const amount = formatUsd(service.rateAmountUsd);
  if (service.rateType !== "starting_from") return amount;
  return t ? t("from", { amount }) : `From ${amount}`;
}

/*
 * Dates are shown in Japan time so server and browser render identically.
 */
const TIME_ZONE = "Asia/Tokyo";
const timeFormat = new Intl.DateTimeFormat("en", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

const dtf = new Map<string, Intl.DateTimeFormat>();
const dateFormatter = (locale: string, kind: "short" | "day" | "long") => {
  const key = `${locale}|${kind}`;
  let f = dtf.get(key);
  if (!f) {
    const opts: Intl.DateTimeFormatOptions =
      kind === "short"
        ? { month: "short", day: "numeric" }
        : kind === "day"
          ? { weekday: "short", month: "short", day: "numeric" }
          : { month: "short", day: "numeric", year: "numeric" };
    f = new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, ...opts });
    dtf.set(key, f);
  }
  return f;
};

/** "2026-09-27" in Japan time — for grouping messages by day. */
export const getDayKey = (iso: string | Date) => dayKeyFormat.format(new Date(iso));

/** "14:05" */
export const formatTime = (iso: string) => timeFormat.format(new Date(iso));

/** Today → "14:05", otherwise "Sep 27" / "9月27日". Used in the conversation list. */
export function formatConversationTime(iso: string, locale = "en") {
  return getDayKey(iso) === getDayKey(new Date())
    ? formatTime(iso)
    : dateFormatter(locale, "short").format(new Date(iso));
}

/** "Today", "Yesterday" or "Sat, Sep 27". Used as day separators in a thread. */
export function formatDayLabel(iso: string, locale = "en") {
  const key = getDayKey(iso);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);
  if (key === getDayKey(new Date())) return cap(rtf.format(0, "day"));
  if (key === getDayKey(new Date(Date.now() - 86_400_000))) return cap(rtf.format(-1, "day"));
  return dateFormatter(locale, "day").format(new Date(iso));
}

/** "Oct 1, 2026" / "2026年10月1日" */
export const formatShortDate = (iso: string, locale = "en") =>
  dateFormatter(locale, "long").format(new Date(iso));

/** "2026-12-15" → "Dec 15, 2026" (date only, no time zone shift). */
export const formatDeadline = (isoDate: string, locale = "en") =>
  new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00Z`));
