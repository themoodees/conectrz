import { mockConversations, type MockConversation } from "./conversations";
import { mockFilterOptions } from "./filterOptions";
import { mockPlans, type MockPlan } from "./plans";
import {
  mockApplications,
  mockProjects,
  type MockApplication,
  type MockProject,
} from "./projects";

/*
 * In-memory state for MOCK MODE only, so actions (saving, messaging, reporting,
 * admin changes) work while designing. It lives in the dev server's memory and
 * resets when the server restarts.
 */

export interface MockReport {
  id: string;
  reason: string;
  details: string | null;
  targetType: "creator" | "company" | "conversation";
  targetId: string;
  targetName: string;
  reporterName: string;
  createdAt: string;
  status: "pending" | "resolved";
  resolution: "dismissed" | "paused" | "banned" | null;
}

export interface MockReview {
  id: string;
  creatorId: string;
  companyId: string;
  companyName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface MockCompanyReview {
  id: string;
  companyId: string;
  creatorId: string;
  creatorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface MockCompany {
  id: string;
  name: string;
  email: string;
  status: "active" | "paused" | "deleted";
  planName: string | null;
  createdAt: string;
}

interface MockStore {
  /** Admin view of companies. */
  companies: MockCompany[];
  /** Admin-set status per creator id (creators not listed are active). */
  creatorStatuses: Record<string, "active" | "paused" | "deleted">;
  categories: Record<
    "niches" | "languages" | "services",
    { id: string; name: string; isActive: boolean }[]
  >;
  activity: {
    id: string;
    actionType: string;
    targetType: string;
    targetId: string;
    details: Record<string, unknown> | null;
    createdAt: string;
  }[];
  savedCreatorIds: string[];
  /** Private birth dates by creator id (companies only ever see the age). */
  creatorBirthDates: Record<string, string>;
  reviews: MockReview[];
  /** Creators' reviews of brands. */
  companyReviews: MockCompanyReview[];
  conversations: MockConversation[];
  /** The mock company's current plan. */
  subscription: {
    planName: string;
    quota: number | null;
    periodStart: string;
    periodEnd: string;
    /** A downgrade that starts when the current period ends. */
    pendingPlanName?: string | null;
  };
  plans: MockPlan[];
  projects: MockProject[];
  applications: MockApplication[];
  reports: MockReport[];
  /** Notification ids the mock user has read (notifications themselves are derived). */
  readNotificationIds: string[];
}

// Kept on globalThis so it survives hot reloads in development.
const globalForMock = globalThis as unknown as { __conectrzMockStore?: MockStore };

const toCategories = (names: string[]) => names.map((name) => ({ id: name, name, isActive: true }));

export const mockStore: MockStore = (globalForMock.__conectrzMockStore ??= {
  readNotificationIds: [],
  companies: [
    {
      id: "co-001",
      name: "Hanami Cosmetics",
      email: "marketing@hanami-cosmetics.jp",
      status: "active",
      planName: "Pro",
      createdAt: "2026-09-10T00:00:00Z",
    },
    {
      id: "co-002",
      name: "Quick Growth Agency",
      email: "hello@quickgrowth.example",
      status: "active",
      planName: "Free",
      createdAt: "2026-09-18T00:00:00Z",
    },
    {
      id: "co-003",
      name: "Tabi Travel Co.",
      email: "pr@tabi-travel.example",
      status: "active",
      planName: "Pro",
      createdAt: "2026-09-02T00:00:00Z",
    },
  ],
  creatorStatuses: {},
  creatorBirthDates: {},
  companyReviews: [
    {
      id: "crv-001",
      companyId: "co-001",
      creatorId: "cr-002",
      creatorName: "Emma",
      rating: 5,
      comment: "Clear brief, quick replies and paid on the date we agreed.",
      createdAt: "2026-10-18T00:00:00Z",
    },
    {
      id: "crv-002",
      companyId: "co-001",
      creatorId: "cr-003",
      creatorName: "Haruka",
      rating: 4,
      comment: "Nice team to work with. The feedback came in two rounds.",
      createdAt: "2026-10-25T00:00:00Z",
    },
  ],
  reviews: [
    {
      id: "rv-001",
      creatorId: "cr-001",
      companyId: "co-001",
      companyName: "Hanami Cosmetics",
      rating: 5,
      comment: "Very professional, delivered on time and the content performed well for us.",
      createdAt: "2026-10-12T00:00:00Z",
    },
    {
      id: "rv-002",
      creatorId: "cr-001",
      companyId: "co-003",
      companyName: "Tabi Travel Co.",
      rating: 4,
      comment: "Great communication. One small revision round, then perfect.",
      createdAt: "2026-10-20T00:00:00Z",
    },
  ],
  categories: {
    niches: toCategories(mockFilterOptions.niches),
    languages: toCategories(mockFilterOptions.languages),
    services: toCategories(mockFilterOptions.services),
  },
  activity: [],
  savedCreatorIds: ["cr-002", "cr-007"],
  conversations: structuredClone(mockConversations),
  subscription: {
    planName: "Pro",
    quota: 10,
    periodStart: "2026-09-01T00:00:00Z",
    periodEnd: "2026-10-01T00:00:00Z",
  },
  plans: structuredClone(mockPlans),
  projects: structuredClone(mockProjects),
  applications: structuredClone(mockApplications),
  reports: [
    {
      id: "rp-001",
      reason: "spam",
      details: "Sent the same promotional message to several creators.",
      targetType: "company",
      targetId: "co-002",
      targetName: "Quick Growth Agency",
      reporterName: "Aoi Nakamura",
      createdAt: "2026-09-26T08:00:00Z",
      status: "pending",
      resolution: null,
    },
    {
      id: "rp-002",
      reason: "fake_profile",
      details: null,
      targetType: "creator",
      targetId: "cr-012",
      targetName: "Rina Fujimoto",
      reporterName: "Hanami Cosmetics",
      createdAt: "2026-09-21T02:30:00Z",
      status: "resolved",
      resolution: "dismissed",
    },
  ],
});
