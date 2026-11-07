import type { AccountStatus } from "./account";

export type AccountKind = "creator" | "company";

export interface AdminReport {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string;
  status: "pending" | "resolved";
  resolution: "dismissed" | "paused" | "banned" | null;
  reporterName: string;
  /** What was reported, as shown to the admin. */
  targetLabel: string;
  /** The account a pause/ban applies to (for conversation reports: the other participant). */
  actionTarget: { kind: AccountKind; id: string; name: string } | null;
}

export interface AdminAccount {
  id: string;
  kind: AccountKind;
  name: string;
  /** Location for creators, contact email for companies. */
  detail: string;
  /** Login email (what identifies test accounts at a glance). */
  email: string | null;
  status: AccountStatus;
  createdAt: string;
  /** Companies only: current plan name. */
  planName?: string | null;
  planPeriodEnd?: string | null;
}

export type CategoryTable = "niches" | "languages" | "services";

export interface AdminCategory {
  id: string;
  /** English name (the source name). */
  name: string;
  /** Japanese name shown to Japanese-language readers; "" falls back to English. */
  nameJa?: string;
  isActive: boolean;
}

export interface AdminActivity {
  id: string;
  actionType: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}
