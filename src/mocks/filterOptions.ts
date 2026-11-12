import { PREFECTURES } from "@/lib/prefectures";
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
    "Health & Wellness",
    "Anime & Manga",
    "Art & Design",
    "Business & Finance",
    "Education",
    "Entertainment",
    "Music",
    "Pets",
    "Sports",
    "Automotive",
    "Other",
  ],
  locations: [...PREFECTURES],
  languages: [
    "Japanese",
    "English",
    "Mandarin Chinese",
    "Korean",
    "Spanish",
    "French",
    "Arabic",
    "Cantonese",
    "Dutch",
    "Hindi",
    "Indonesian",
    "Italian",
    "Polish",
    "Russian",
    "Tagalog",
    "Turkish",
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
