import type { PortfolioItem } from "@/types/creator";

/*
 * MOCK DATA — portfolio items shown on Creator Profile pages, keyed by creator id.
 * Creators without an entry show an empty portfolio state.
 */

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=1000&q=80`;

export const mockPortfolio: Record<string, PortfolioItem[]> = {
  "cr-001": [
    {
      id: "pf-001",
      mediaType: "image",
      mediaUrl: image("photo-1556228578-8c89e6adf883"),
      title: "Skincare routine",
      description: "Instagram carousel for a toner launch",
    },
    {
      id: "pf-002",
      mediaType: "image",
      mediaUrl: image("photo-1522335789203-aabd1fc54bc9"),
      title: "Everyday makeup",
      description: "Reel for a cushion foundation",
    },
    {
      id: "pf-003",
      mediaType: "image",
      mediaUrl: image("photo-1512290923902-8a9f81dc236c"),
      title: "Serum review",
      description: null,
    },
  ],
  "cr-003": [
    {
      id: "pf-004",
      mediaType: "image",
      mediaUrl: image("photo-1556228578-8c89e6adf883"),
      title: "Product flat lay",
      description: "UGC photo set for a skincare brand",
    },
    {
      id: "pf-005",
      mediaType: "image",
      mediaUrl: image("photo-1526170375885-4d8ecf77b99f"),
      title: "Home product demo",
      description: "15-second UGC video",
    },
  ],
  "cr-004": [
    {
      id: "pf-006",
      mediaType: "image",
      mediaUrl: image("photo-1504674900247-0877df9cc836"),
      title: "Café series",
      description: "TikTok series for a coffee brand",
    },
    {
      id: "pf-007",
      mediaType: "image",
      mediaUrl: image("photo-1493770348161-369560ae357d"),
      title: "Breakfast spots",
      description: null,
    },
  ],
  "cr-005": [
    {
      id: "pf-008",
      mediaType: "image",
      mediaUrl: image("photo-1493976040374-85c8e12f0c0e"),
      title: "Kyoto guide",
      description: "Spanish-language travel guide",
    },
    {
      id: "pf-009",
      mediaType: "image",
      mediaUrl: image("photo-1540959733332-eab4deabeeaf"),
      title: "Tokyo weekend",
      description: null,
    },
  ],
  "cr-006": [
    {
      id: "pf-010",
      mediaType: "image",
      mediaUrl: image("photo-1505740420928-5e560c06d30e"),
      title: "Headphones review",
      description: "YouTube integration",
    },
    {
      id: "pf-011",
      mediaType: "image",
      mediaUrl: image("photo-1523275335684-37898b6baf30"),
      title: "Smartwatch unboxing",
      description: null,
    },
  ],
};
