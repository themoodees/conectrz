import type { Creator } from "@/types/creator";

/*
 * MOCK DATA — for UI development only.
 * Not inserted into Supabase. Replace by editing src/lib/data/creators.ts.
 *
 * Photos are temporary Unsplash placeholders. To change one, edit `photoUrl`.
 * (Any new image host must be allowed in next.config.ts → images.remotePatterns.)
 */

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=1000&q=80`;

export const mockCreators: Creator[] = [
  {
    // Japanese beauty creator in Tokyo, Instagram with a significant audience
    id: "cr-001",
    displayName: "Yui Tanaka",
    photoUrl: photo("photo-1544005313-94ddf0286df2"),
    country: "Japan",
    prefecture: "Tokyo",
    city: "Shibuya",
    isAvailable: true,
    languages: [{ name: "Japanese", proficiency: "native" }],
    niches: ["Beauty", "Skincare"],
    services: [
      { name: "Instagram post", rateType: "starting_from", rateAmountJpy: 120000 },
      { name: "Instagram Reel", rateType: "starting_from", rateAmountJpy: 180000 },
    ],
    socialAccounts: [
      { platform: "instagram", handle: "yui.beauty", followerCount: 248000 },
      { platform: "tiktok", handle: "yuitanaka", followerCount: 61000 },
    ],
  },
  {
    // International creator living in Japan, bilingual
    id: "cr-002",
    displayName: "Emma Collins",
    photoUrl: photo("photo-1494790108377-be9c29b29330"),
    country: "Japan",
    prefecture: "Tokyo",
    city: "Meguro",
    isAvailable: true,
    languages: [
      { name: "English", proficiency: "native" },
      { name: "Japanese", proficiency: "conversational" },
    ],
    niches: ["Lifestyle", "Travel"],
    services: [
      { name: "UGC video", rateType: "starting_from", rateAmountJpy: 35000 },
      { name: "Instagram Reel", rateType: "starting_from", rateAmountJpy: 60000 },
    ],
    socialAccounts: [
      { platform: "instagram", handle: "emmaintokyo", followerCount: 38500 },
      { platform: "youtube", handle: "EmmaInTokyo", followerCount: 12400 },
    ],
  },
  {
    // UGC-only creator — no audience, content for brand channels
    id: "cr-003",
    displayName: "Haruka Mori",
    photoUrl: photo("photo-1517841905240-472988babdf9"),
    country: "Japan",
    prefecture: "Osaka",
    city: "Osaka",
    isAvailable: true,
    languages: [
      { name: "Japanese", proficiency: "native" },
      { name: "English", proficiency: "conversational" },
    ],
    niches: ["Skincare", "Home & Interior"],
    services: [
      { name: "UGC video", rateType: "flat", rateAmountJpy: 28000 },
      { name: "UGC photos", rateType: "flat", rateAmountJpy: 18000 },
      { name: "Product photography", rateType: "starting_from", rateAmountJpy: 40000 },
    ],
    socialAccounts: [],
  },
  {
    // TikTok-focused creator
    id: "cr-004",
    displayName: "Ren Kobayashi",
    photoUrl: photo("photo-1500648767791-00dcc994a43e"),
    country: "Japan",
    prefecture: "Tokyo",
    city: "Shimokitazawa",
    isAvailable: true,
    languages: [{ name: "Japanese", proficiency: "native" }],
    niches: ["Food & Drink", "Lifestyle"],
    services: [
      { name: "TikTok video", rateType: "starting_from", rateAmountJpy: 90000 },
    ],
    socialAccounts: [
      { platform: "tiktok", handle: "ren.eats", followerCount: 412000 },
      { platform: "instagram", handle: "ren.eats", followerCount: 27000 },
    ],
  },
  {
    // Multilingual creator
    id: "cr-005",
    displayName: "Sofia Martínez",
    photoUrl: photo("photo-1524504388940-b1c1722653e1"),
    country: "Japan",
    prefecture: "Kyoto",
    city: "Kyoto",
    isAvailable: true,
    languages: [
      { name: "Spanish", proficiency: "native" },
      { name: "English", proficiency: "fluent" },
      { name: "Japanese", proficiency: "fluent" },
    ],
    niches: ["Travel", "Culture"],
    services: [
      { name: "UGC video", rateType: "starting_from", rateAmountJpy: 40000 },
      { name: "Instagram post", rateType: "starting_from", rateAmountJpy: 55000 },
      { name: "Localization & voiceover", rateType: "starting_from", rateAmountJpy: 30000 },
    ],
    socialAccounts: [
      { platform: "instagram", handle: "sofia.kyoto", followerCount: 21800 },
    ],
  },
  {
    // Creator offering several services, cross-platform
    id: "cr-006",
    displayName: "Daiki Sato",
    photoUrl: photo("photo-1507003211169-0a1dd7228f2d"),
    country: "Japan",
    prefecture: "Kanagawa",
    city: "Yokohama",
    isAvailable: false,
    languages: [
      { name: "Japanese", proficiency: "native" },
      { name: "English", proficiency: "fluent" },
    ],
    niches: ["Tech", "Gaming"],
    services: [
      { name: "YouTube integration", rateType: "starting_from", rateAmountJpy: 250000 },
      { name: "TikTok video", rateType: "starting_from", rateAmountJpy: 80000 },
      { name: "UGC video", rateType: "starting_from", rateAmountJpy: 45000 },
      { name: "Product review", rateType: "starting_from", rateAmountJpy: 60000 },
    ],
    socialAccounts: [
      { platform: "youtube", handle: "DaikiTech", followerCount: 186000 },
      { platform: "tiktok", handle: "daiki.tech", followerCount: 94000 },
      { platform: "x", handle: "daikisato", followerCount: 32000 },
    ],
  },
  {
    id: "cr-007",
    displayName: "Aoi Nakamura",
    photoUrl: photo("photo-1534528741775-53994a69daeb"),
    country: "Japan",
    prefecture: "Fukuoka",
    city: "Fukuoka",
    isAvailable: true,
    languages: [
      { name: "Japanese", proficiency: "native" },
      { name: "Korean", proficiency: "conversational" },
    ],
    niches: ["Fashion", "Beauty"],
    services: [
      { name: "Instagram Reel", rateType: "starting_from", rateAmountJpy: 70000 },
      { name: "TikTok video", rateType: "starting_from", rateAmountJpy: 65000 },
    ],
    socialAccounts: [
      { platform: "instagram", handle: "aoi.style", followerCount: 89000 },
      { platform: "tiktok", handle: "aoi.style", followerCount: 54000 },
    ],
  },
  {
    // UGC creator with a small personal account (no audience claims)
    id: "cr-008",
    displayName: "Liam Chen",
    photoUrl: photo("photo-1506794778202-cad84cf45f1d"),
    country: "Japan",
    prefecture: "Tokyo",
    city: "Setagaya",
    isAvailable: true,
    languages: [
      { name: "English", proficiency: "native" },
      { name: "Mandarin Chinese", proficiency: "native" },
      { name: "Japanese", proficiency: "conversational" },
    ],
    niches: ["Tech", "Lifestyle"],
    services: [
      { name: "UGC video", rateType: "flat", rateAmountJpy: 32000 },
      { name: "Product review", rateType: "flat", rateAmountJpy: 25000 },
    ],
    socialAccounts: [
      { platform: "instagram", handle: "liam.makes", followerCount: null },
    ],
  },
  {
    id: "cr-009",
    displayName: "Mei Watanabe",
    photoUrl: photo("photo-1529626455594-4ff0802cfb7e"),
    country: "Japan",
    prefecture: "Hokkaido",
    city: "Sapporo",
    isAvailable: true,
    languages: [{ name: "Japanese", proficiency: "native" }],
    niches: ["Food & Drink", "Travel"],
    services: [
      { name: "Instagram post", rateType: "starting_from", rateAmountJpy: 45000 },
      { name: "UGC photos", rateType: "flat", rateAmountJpy: 20000 },
    ],
    socialAccounts: [
      { platform: "instagram", handle: "mei.hokkaido", followerCount: 46200 },
    ],
  },
  {
    id: "cr-010",
    displayName: "Chloé Bernard",
    photoUrl: photo("photo-1438761681033-6461ffad8d80"),
    country: "Japan",
    prefecture: "Tokyo",
    city: "Minato",
    isAvailable: false,
    languages: [
      { name: "French", proficiency: "native" },
      { name: "English", proficiency: "fluent" },
      { name: "Japanese", proficiency: "fluent" },
    ],
    niches: ["Fashion", "Lifestyle"],
    services: [
      { name: "Instagram Reel", rateType: "starting_from", rateAmountJpy: 150000 },
      { name: "Event appearance", rateType: "starting_from", rateAmountJpy: 200000 },
    ],
    socialAccounts: [
      { platform: "instagram", handle: "chloe.tokyo", followerCount: 132000 },
    ],
  },
  {
    id: "cr-011",
    displayName: "Kenta Ishikawa",
    photoUrl: photo("photo-1539571696357-5a69c17a67c6"),
    country: "Japan",
    prefecture: "Okinawa",
    city: "Naha",
    isAvailable: true,
    languages: [
      { name: "Japanese", proficiency: "native" },
      { name: "English", proficiency: "conversational" },
    ],
    niches: ["Fitness", "Travel"],
    services: [
      { name: "YouTube integration", rateType: "starting_from", rateAmountJpy: 110000 },
      { name: "UGC video", rateType: "starting_from", rateAmountJpy: 38000 },
    ],
    socialAccounts: [
      { platform: "youtube", handle: "KentaOutdoors", followerCount: 73000 },
      { platform: "instagram", handle: "kenta.okinawa", followerCount: 18900 },
    ],
  },
  {
    id: "cr-012",
    displayName: "Rina Fujimoto",
    photoUrl: photo("photo-1531746020798-e6953c6e8e04"),
    country: "Japan",
    prefecture: "Aichi",
    city: "Nagoya",
    isAvailable: true,
    languages: [{ name: "Japanese", proficiency: "native" }],
    niches: ["Parenting", "Home & Interior"],
    services: [
      { name: "UGC video", rateType: "flat", rateAmountJpy: 22000 },
      { name: "Instagram post", rateType: "starting_from", rateAmountJpy: 30000 },
    ],
    socialAccounts: [
      { platform: "instagram", handle: "rina.home", followerCount: 8700 },
    ],
  },
];
