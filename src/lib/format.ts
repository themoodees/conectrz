import type { Creator, CreatorService, SocialAccount } from "@/types/creator";

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
