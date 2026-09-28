import type { DiscoveryFilterOptions } from "@/types/discovery";

/*
 * MOCK DATA — filter option lists.
 * Later these come from the Supabase lookup tables
 * (`niches`, `languages`, `services`) and creator prefectures.
 */
export const mockFilterOptions: DiscoveryFilterOptions = {
  niches: [
    "Beauty",
    "Skincare",
    "Fashion",
    "Food & Drink",
    "Travel",
    "Culture",
    "Lifestyle",
    "Fitness",
    "Tech",
    "Gaming",
    "Parenting",
    "Home & Interior",
  ],
  locations: [
    "Tokyo",
    "Kanagawa",
    "Osaka",
    "Kyoto",
    "Aichi",
    "Fukuoka",
    "Hokkaido",
    "Okinawa",
  ],
  languages: [
    "Japanese",
    "English",
    "Mandarin Chinese",
    "Korean",
    "Spanish",
    "French",
  ],
  services: [
    "UGC video",
    "UGC photos",
    "Product photography",
    "Product review",
    "Instagram post",
    "Instagram Reel",
    "TikTok video",
    "YouTube integration",
    "Localization & voiceover",
    "Event appearance",
  ],
};
