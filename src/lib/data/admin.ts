import "server-only";
import type {
  AdminAccount,
  AdminActivity,
  AdminCategory,
  AdminReport,
  CategoryTable,
} from "@/types/admin";
import { isMockMode } from "@/lib/config";
import { formatLocation } from "@/lib/format";
import { mockCreators } from "@/mocks/creators";
import { mockStore } from "@/mocks/store";
import { getSupabaseSession } from "./session";

/*
 * Data for the admin panel. Supabase access relies on the admin RLS policies
 * (is_admin()), so these return nothing useful for non-admins.
 */

/* ── Reports ──────────────────────────────────────────────────────────────── */

export async function getReports(): Promise<AdminReport[]> {
  if (isMockMode) {
    return mockStore.reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      details: r.details,
      createdAt: r.createdAt,
      status: r.status,
      resolution: r.resolution,
      reporterName: r.reporterName,
      targetLabel: `${r.targetType === "creator" ? "Creator" : r.targetType === "company" ? "Company" : "Conversation"}: ${r.targetName}`,
      actionTarget:
        r.targetType === "conversation"
          ? null
          : { kind: r.targetType, id: r.targetId, name: r.targetName },
    }));
  }

  const { supabase } = await getSupabaseSession();
  const { data, error } = await supabase
    .from("reports")
    .select(
      `id, reason, details, created_at, status, resolution, reporter_id,
       creator_profiles ( id, display_name ),
       company_profiles ( id, name ),
       conversations ( id, creator_id, company_id,
         creator_profiles ( display_name ), company_profiles ( name ) )`,
    )
    .order("status")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const names = await getAccountNames(data.map((r) => r.reporter_id));

  return data.map((r) => {
    let targetLabel = "Unknown";
    let actionTarget: AdminReport["actionTarget"] = null;

    if (r.creator_profiles) {
      targetLabel = `Creator: ${r.creator_profiles.display_name}`;
      actionTarget = {
        kind: "creator",
        id: r.creator_profiles.id,
        name: r.creator_profiles.display_name,
      };
    } else if (r.company_profiles) {
      targetLabel = `Company: ${r.company_profiles.name}`;
      actionTarget = { kind: "company", id: r.company_profiles.id, name: r.company_profiles.name };
    } else if (r.conversations) {
      const c = r.conversations;
      const creatorName = c.creator_profiles?.display_name ?? "Creator";
      const companyName = c.company_profiles?.name ?? "Company";
      targetLabel = `Conversation: ${companyName} ↔ ${creatorName}`;
      // Actions apply to the participant who didn't file the report.
      actionTarget =
        r.reporter_id === c.creator_id
          ? { kind: "company", id: c.company_id, name: companyName }
          : { kind: "creator", id: c.creator_id, name: creatorName };
    }

    return {
      id: r.id,
      reason: r.reason,
      details: r.details,
      createdAt: r.created_at,
      status: r.status,
      resolution: r.resolution,
      reporterName: names.get(r.reporter_id) ?? "Unknown user",
      targetLabel,
      actionTarget,
    };
  });
}

/** Display names for a set of user ids (creators or companies). */
async function getAccountNames(ids: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids)];
  const names = new Map<string, string>();
  if (unique.length === 0) return names;

  const { supabase } = await getSupabaseSession();
  const [creators, companies] = await Promise.all([
    supabase.from("creator_profiles").select("id, display_name").in("id", unique),
    supabase.from("company_profiles").select("id, name").in("id", unique),
  ]);
  creators.data?.forEach((c) => names.set(c.id, c.display_name));
  companies.data?.forEach((c) => names.set(c.id, c.name));
  return names;
}

/* ── Accounts ─────────────────────────────────────────────────────────────── */

export async function getAccounts(): Promise<{
  creators: AdminAccount[];
  companies: AdminAccount[];
}> {
  if (isMockMode) {
    return {
      creators: mockCreators.map((c) => ({
        id: c.id,
        kind: "creator",
        name: c.displayName,
        detail: formatLocation(c),
        status: mockStore.creatorStatuses[c.id] ?? "active",
        createdAt: "2026-09-15T00:00:00Z",
      })),
      companies: mockStore.companies.map((c) => ({
        id: c.id,
        kind: "company",
        name: c.name,
        detail: c.email,
        status: c.status,
        createdAt: c.createdAt,
        planName: c.planName,
        planPeriodEnd: null,
      })),
    };
  }

  const { supabase } = await getSupabaseSession();
  const now = new Date().toISOString();
  const [creators, companies] = await Promise.all([
    supabase
      .from("creator_profiles")
      .select("id, display_name, city, prefecture, country, status, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("company_profiles")
      .select(
        "id, name, contact_email, status, created_at, subscriptions ( status, current_period_start, current_period_end, created_at, subscription_tiers ( name ) )",
      )
      .order("created_at", { ascending: false }),
  ]);
  if (creators.error) throw creators.error;
  if (companies.error) throw companies.error;

  return {
    creators: creators.data.map((c) => ({
      id: c.id,
      kind: "creator",
      name: c.display_name,
      detail: formatLocation(c),
      status: c.status,
      createdAt: c.created_at,
    })),
    companies: companies.data.map((c) => {
      // Same rule as the conversation limit: newest active subscription covering now.
      const current = c.subscriptions
        .filter(
          (s) =>
            s.status === "active" && s.current_period_start <= now && s.current_period_end > now,
        )
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      return {
        id: c.id,
        kind: "company",
        name: c.name,
        detail: c.contact_email,
        status: c.status,
        createdAt: c.created_at,
        planName: current?.subscription_tiers?.name ?? null,
        planPeriodEnd: current?.current_period_end ?? null,
      };
    }),
  };
}

/* ── Categories ───────────────────────────────────────────────────────────── */

export async function getCategories(): Promise<Record<CategoryTable, AdminCategory[]>> {
  if (isMockMode) return mockStore.categories;

  const { supabase } = await getSupabaseSession();
  const load = async (table: CategoryTable) => {
    const { data, error } = await supabase.from(table).select("id, name, is_active").order("name");
    if (error) throw error;
    return data.map((row) => ({ id: row.id, name: row.name, isActive: row.is_active }));
  };
  const [niches, languages, services] = await Promise.all([
    load("niches"),
    load("languages"),
    load("services"),
  ]);
  return { niches, languages, services };
}

/* ── Activity log ─────────────────────────────────────────────────────────── */

export async function getActivity(limit = 50): Promise<AdminActivity[]> {
  if (isMockMode) return [...mockStore.activity].reverse().slice(0, limit);

  const { supabase } = await getSupabaseSession();
  const { data, error } = await supabase
    .from("admin_action_log")
    .select("id, action_type, target_type, target_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    actionType: row.action_type,
    targetType: row.target_type,
    targetId: row.target_id,
    details: (row.details as Record<string, unknown> | null) ?? null,
    createdAt: row.created_at,
  }));
}
