import type { AccountStatus } from "./account";
import type { LanguageProficiency, RateType, SocialPlatform } from "./creator";

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
  bio: string;
  prefecture: string;
  city: string;
  isAvailable: boolean;
  photoUrl: string | null;
  nicheIds: string[];
  languages: { languageId: string; proficiency: LanguageProficiency }[];
  services: { serviceId: string; rateType: RateType; rateAmountJpy: number }[];
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
