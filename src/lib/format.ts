import type { Creator, CreatorService, LanguageProficiency, SocialAccount } from "@/types/creator";

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

/** 248000 → "248K" */
export const formatFollowers = (count: number) => compactNumber.format(count);

/** 35000 → "¥35,000" */
export const formatJpy = (amount: number) => yen.format(amount);

/** "Shibuya, Tokyo" — falls back gracefully when parts are missing. */
export function formatLocation(creator: Pick<Creator, "city" | "prefecture" | "country">) {
  const parts = [creator.city, creator.prefecture].filter(
    (part, index, all): part is string => Boolean(part) && all.indexOf(part) === index,
  );
  return parts.length > 0 ? parts.join(", ") : creator.country;
}

export function getLowestRate(services: CreatorService[]): number | null {
  if (services.length === 0) return null;
  return Math.min(...services.map((service) => service.rateAmountJpy));
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

export const PROFICIENCY_LABELS: Record<LanguageProficiency, string> = {
  native: "Native",
  fluent: "Fluent",
  conversational: "Conversational",
};

/** "¥35,000" for flat rates, "From ¥35,000" for starting-from rates. */
export function formatRate(service: CreatorService) {
  const amount = formatJpy(service.rateAmountJpy);
  return service.rateType === "starting_from" ? `From ${amount}` : amount;
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
const shortDateFormat = new Intl.DateTimeFormat("en", {
  timeZone: TIME_ZONE,
  month: "short",
  day: "numeric",
});
const dayFormat = new Intl.DateTimeFormat("en", {
  timeZone: TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
});
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

/** "2026-09-27" in Japan time — for grouping messages by day. */
export const getDayKey = (iso: string | Date) => dayKeyFormat.format(new Date(iso));

/** "14:05" */
export const formatTime = (iso: string) => timeFormat.format(new Date(iso));

/** Today → "14:05", otherwise "Sep 27". Used in the conversation list. */
export function formatConversationTime(iso: string) {
  return getDayKey(iso) === getDayKey(new Date())
    ? formatTime(iso)
    : shortDateFormat.format(new Date(iso));
}

/** "Today", "Yesterday" or "Sat, Sep 27". Used as day separators in a thread. */
export function formatDayLabel(iso: string) {
  const key = getDayKey(iso);
  if (key === getDayKey(new Date())) return "Today";
  if (key === getDayKey(new Date(Date.now() - 86_400_000))) return "Yesterday";
  return dayFormat.format(new Date(iso));
}

const longDateFormat = new Intl.DateTimeFormat("en", {
  timeZone: TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** "Oct 1, 2026" */
export const formatShortDate = (iso: string) => longDateFormat.format(new Date(iso));
