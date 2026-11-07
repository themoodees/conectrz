import type { Locale } from "@/i18n/config";
import type { PaymentMethod } from "@/lib/payments";
import type { ApplicationStatus, ProjectStatus } from "@/types/projects";

/* MOCK DATA — projects and applications for design work (mock mode). */

export interface MockProject {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  writtenLanguage: Locale;
  budgetUsd: number;
  deliveryDeadline: string;
  status: ProjectStatus;
  createdAt: string;
  services: string[];
  niches: string[];
  languages: string[];
  paymentMethods: PaymentMethod[];
  referenceLinks?: string[];
  editedAt?: string | null;
}

export interface MockApplication {
  id: string;
  projectId: string;
  creatorId: string;
  message: string;
  proposedAmountUsd: number;
  status: ApplicationStatus;
  createdAt: string;
}

export const mockProjects: MockProject[] = [
  {
    id: "pj-001",
    companyId: "co-001",
    companyName: "Hanami Cosmetics",
    title: "Autumn skincare UGC videos",
    writtenLanguage: "en",
    description:
      "We're launching a new sensitive-skin line and need three short vertical videos (15–30 seconds) showing a real morning routine. Natural light, no heavy editing. Products are shipped to you free of charge.",
    budgetUsd: 600,
    deliveryDeadline: "2026-12-15",
    status: "open",
    createdAt: "2026-10-20T09:00:00Z",
    services: ["UGC video"],
    niches: ["Beauty", "Skincare"],
    languages: ["Japanese", "English"],
    paymentMethods: ["bank_transfer", "wise"],
    referenceLinks: ["https://www.instagram.com/hanami.cosmetics/", "https://hanami-cosmetics.example/autumn-moodboard"],
  },
  {
    id: "pj-002",
    companyId: "co-001",
    companyName: "Hanami Cosmetics",
    title: "Product photos for the winter set",
    writtenLanguage: "en",
    description: "Ten styled product photos of our winter gift set, for the website and Instagram.",
    budgetUsd: 350,
    deliveryDeadline: "2026-11-30",
    status: "closed",
    createdAt: "2026-09-25T09:00:00Z",
    services: ["Product photography"],
    niches: ["Beauty"],
    languages: ["Japanese"],
    paymentMethods: ["bank_transfer", "wise"],
  },
  {
    id: "pj-003",
    companyId: "co-050",
    companyName: "Kumo Travel Co.",
    title: "Weekend trips around Japan: Reels series",
    writtenLanguage: "en",
    description:
      "A four-part Instagram Reel series showing weekend getaways from Tokyo for English-speaking travellers. Storyline and shot list provided; you bring the voice and the eye.",
    budgetUsd: 1200,
    deliveryDeadline: "2027-01-20",
    status: "open",
    createdAt: "2026-10-28T09:00:00Z",
    services: ["Instagram Reel"],
    niches: ["Travel", "Lifestyle"],
    languages: ["English"],
    paymentMethods: ["bank_transfer", "wise"],
  },
  {
    id: "pj-004",
    companyId: "co-051",
    companyName: "Mochi Home",
    title: "Home organisation TikToks",
    writtenLanguage: "en",
    description: "Three TikTok videos using our storage range in a real home. Cosy, honest, not salesy.",
    budgetUsd: 450,
    deliveryDeadline: "2026-12-05",
    status: "open",
    createdAt: "2026-10-30T09:00:00Z",
    services: ["TikTok video"],
    niches: ["Home & Interior"],
    languages: ["Japanese"],
    paymentMethods: ["bank_transfer", "wise"],
  },
];

export const mockApplications: MockApplication[] = [
  {
    id: "ap-001",
    projectId: "pj-001",
    creatorId: "cr-003",
    message:
      "I make clean, natural skincare videos for brands and I'm happy to follow your brief. I can deliver three videos in two weeks.",
    proposedAmountUsd: 550,
    status: "submitted",
    createdAt: "2026-10-22T10:00:00Z",
  },
  {
    id: "ap-002",
    projectId: "pj-001",
    creatorId: "cr-002",
    message: "I'd love to try this line. I film in English and Japanese, so I can do both versions.",
    proposedAmountUsd: 700,
    status: "submitted",
    createdAt: "2026-10-24T08:30:00Z",
  },
  {
    id: "ap-003",
    projectId: "pj-003",
    creatorId: "cr-001",
    message: "I travel around Kanto most weekends. Happy to share past Reels on request.",
    proposedAmountUsd: 1100,
    status: "submitted",
    createdAt: "2026-10-29T11:00:00Z",
  },
];
