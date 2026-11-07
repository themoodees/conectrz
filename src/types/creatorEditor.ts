import type { PaymentMethod } from "@/lib/payments";
import type { AccountStatus } from "./account";
import type { Gender, LanguageProficiency, RateType, SocialPlatform } from "./creator";

/** A lookup-table option (niche, language or service). */
export interface CategoryOption {
  id: string;
  name: string;
}

/** Everything the creator profile editor needs, including row ids. */
export interface CreatorEditorData {
  id: string;
  status: AccountStatus;
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
  /** yyyy-mm-dd, or "" when not set. Private: companies only see the age. */
  birthDate: string;
  gender: Gender | "";
  prefecture: string;
  /** Official 5-digit municipality code, or "" when the city is free text. */
  cityCode: string;
  /** English name of the picked city, or the creator's own text. */
  city: string;
  isAvailable: boolean;
  paymentMethods: PaymentMethod[];
  photoUrl: string | null;
  nicheIds: string[];
  languages: { languageId: string; proficiency: LanguageProficiency }[];
  services: { serviceId: string; rateType: RateType; rateAmountUsd: number }[];
  socialAccounts: {
    id?: string;
    platform: SocialPlatform;
    handle: string;
    profileUrl: string;
    followerCount: number | null;
  }[];
  portfolio: {
    id: string;
    mediaUrl: string;
    mediaType: string;
    title: string | null;
    description: string | null;
  }[];
}

export interface CreatorEditorOptions {
  niches: CategoryOption[];
  languages: CategoryOption[];
  services: CategoryOption[];
}
