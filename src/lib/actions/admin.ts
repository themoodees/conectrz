"use server";

import { revalidatePath } from "next/cache";
import type { AccountStatus } from "@/types/account";
import type { AccountKind, CategoryTable } from "@/types/admin";
import type { Database, Json } from "@/lib/supabase/database.types";
import { isMockMode } from "@/lib/config";
import { getCurrentRole, requireSupabaseUser } from "@/lib/data/session";
import { mockStore } from "@/mocks/store";

/*
 * Admin panel actions. Every action checks the admin role here AND is limited by
 * the database's admin RLS policies. Each change is written to admin_action_log.
 */

type ActionType = Database["public"]["Enums"]["admin_action_type"];

export interface AdminResult {
  error?: string;
  success?: string;
}

async function requireAdmin() {
  const { supabase, user } = await requireSupabaseUser();
  if ((await getCurrentRole()) !== "admin") throw new Error("Admins only");
  return { supabase, user };
}

async function logAction(
  actionType: ActionType,
  targetType: string,
  targetId: string,
  details: Record<string, Json> | null = null,
) {
  if (isMockMode) {
    mockStore.activity.push({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actionType,
      targetType,
      targetId,
      details,
      createdAt: new Date().toISOString(),
    });
    return;
  }
  const { supabase, user } = await requireAdmin();
  await supabase.from("admin_action_log").insert({
    admin_id: user.id,
    action_type: actionType,
    target_type: targetType,
    target_id: targetId,
    details,
  });
}

/* ── Account status (pause / ban / reactivate) ────────────────────────────── */

/** "deleted" is used as the banned state (account_status has no "banned" value). */
export async function setAccountStatus(
  kind: AccountKind,
  accountId: string,
  status: AccountStatus,
): Promise<AdminResult> {
  if (!["active", "paused", "deleted"].includes(status)) return { error: "Invalid status." };

  if (isMockMode) {
    if (kind === "creator") mockStore.creatorStatuses[accountId] = status;
    else {
      const company = mockStore.companies.find((c) => c.id === accountId);
      if (company) company.status = status;
    }
  } else {
    const { supabase } = await requireAdmin();
    const { error } =
      kind === "creator"
        ? await supabase.from("creator_profiles").update({ status }).eq("id", accountId)
        : await supabase.from("company_profiles").update({ status }).eq("id", accountId);
    if (error) return { error: "Couldn't update the account." };
  }

  // No "reactivated" action type exists; reactivation is logged as profile_paused with new_status.
  const actionType: ActionType = status === "deleted" ? "account_banned" : "profile_paused";
  await logAction(actionType, kind, accountId, { new_status: status });

  revalidatePath("/admin", "layout");
  revalidatePath("/discover");
  return { success: "Account updated." };
}

/* ── Reports ──────────────────────────────────────────────────────────────── */

export async function resolveReport(
  reportId: string,
  resolution: "dismissed" | "paused" | "banned",
  target: { kind: AccountKind; id: string } | null,
): Promise<AdminResult> {
  if (resolution !== "dismissed") {
    if (!target) return { error: "This report has no account to act on." };
    const result = await setAccountStatus(
      target.kind,
      target.id,
      resolution === "paused" ? "paused" : "deleted",
    );
    if (result.error) return result;
  }

  if (isMockMode) {
    const report = mockStore.reports.find((r) => r.id === reportId);
    if (report) Object.assign(report, { status: "resolved", resolution });
  } else {
    const { supabase, user } = await requireAdmin();
    const { error } = await supabase
      .from("reports")
      .update({
        status: "resolved",
        resolution,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", reportId);
    if (error) return { error: "Couldn't resolve the report." };
  }

  revalidatePath("/admin", "layout");
  return { success: "Report resolved." };
}

/* ── Categories ───────────────────────────────────────────────────────────── */

const CATEGORY_TABLES: CategoryTable[] = ["niches", "languages", "services"];

export async function createCategory(table: CategoryTable, name: string): Promise<AdminResult> {
  const clean = name.trim().slice(0, 60);
  if (!CATEGORY_TABLES.includes(table)) return { error: "Invalid category." };
  if (!clean) return { error: "Enter a name." };

  let id: string;
  if (isMockMode) {
    if (mockStore.categories[table].some((c) => c.name.toLowerCase() === clean.toLowerCase())) {
      return { error: "That name already exists." };
    }
    id = clean;
    mockStore.categories[table].push({ id, name: clean, isActive: true });
  } else {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from(table)
      .insert({ name: clean })
      .select("id")
      .single();
    if (error)
      return { error: error.code === "23505" ? "That name already exists." : "Couldn't add it." };
    id = data.id;
  }

  await logAction("category_created", table, id, { name: clean });
  revalidatePath("/admin/categories");
  return { success: `Added “${clean}”.` };
}

export async function updateCategory(
  table: CategoryTable,
  id: string,
  changes: { name?: string; isActive?: boolean },
): Promise<AdminResult> {
  if (!CATEGORY_TABLES.includes(table)) return { error: "Invalid category." };
  const name = changes.name?.trim().slice(0, 60);
  if (changes.name !== undefined && !name) return { error: "Enter a name." };

  if (isMockMode) {
    const category = mockStore.categories[table].find((c) => c.id === id);
    if (!category) return { error: "Not found." };
    if (name) category.name = name;
    if (changes.isActive !== undefined) category.isActive = changes.isActive;
  } else {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from(table)
      .update({
        ...(name ? { name } : {}),
        ...(changes.isActive !== undefined ? { is_active: changes.isActive } : {}),
      })
      .eq("id", id);
    if (error)
      return { error: error.code === "23505" ? "That name already exists." : "Couldn't save." };
  }

  await logAction(changes.isActive === false ? "category_removed" : "category_updated", table, id, {
    ...(name ? { name } : {}),
    ...(changes.isActive !== undefined ? { is_active: changes.isActive } : {}),
  });
  revalidatePath("/admin/categories");
  return { success: "Saved." };
}

/* ── Plans (subscription tiers) ───────────────────────────────────────────── */

export async function savePlan(plan: {
  id?: string;
  name: string;
  monthlyPriceJpy: number;
  conversationQuota: number;
  isActive: boolean;
}): Promise<AdminResult> {
  const name = plan.name.trim().slice(0, 40);
  if (!name) return { error: "Enter a plan name." };
  if (!Number.isInteger(plan.monthlyPriceJpy) || plan.monthlyPriceJpy < 0) {
    return { error: "Price must be a whole number of yen." };
  }
  if (!Number.isInteger(plan.conversationQuota) || plan.conversationQuota < 0) {
    return { error: "Conversation limit must be a whole number." };
  }

  let id = plan.id;
  if (isMockMode) {
    const existing = plan.id ? mockStore.plans.find((p) => p.id === plan.id) : null;
    if (existing) Object.assign(existing, { ...plan, name });
    else {
      id = `tier-${Date.now()}`;
      mockStore.plans.push({ ...plan, id, name });
    }
  } else {
    const { supabase } = await requireAdmin();
    const values = {
      name,
      monthly_price_jpy: plan.monthlyPriceJpy,
      conversation_quota: plan.conversationQuota,
      is_active: plan.isActive,
    };
    const { data, error } = plan.id
      ? await supabase
          .from("subscription_tiers")
          .update(values)
          .eq("id", plan.id)
          .select("id")
          .single()
      : await supabase.from("subscription_tiers").insert(values).select("id").single();
    if (error)
      return { error: error.code === "23505" ? "A plan with that name exists." : "Couldn't save." };
    id = data.id;
  }

  await logAction("subscription_tier_changed", "subscription_tier", id!, {
    name,
    monthly_price_jpy: plan.monthlyPriceJpy,
    conversation_quota: plan.conversationQuota,
    is_active: plan.isActive,
  });
  revalidatePath("/admin/plans");
  revalidatePath("/plans");
  return { success: "Plan saved." };
}

/* ── Company subscriptions ────────────────────────────────────────────────── */

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

/** Switches a company to a plan: ends current subscriptions and starts a new period today. */
export async function grantPlan(
  companyId: string,
  tierId: string,
  months: number,
): Promise<AdminResult> {
  if (!Number.isInteger(months) || months < 1 || months > 36)
    return { error: "Choose 1–36 months." };

  if (isMockMode) {
    const company = mockStore.companies.find((c) => c.id === companyId);
    const plan = mockStore.plans.find((p) => p.id === tierId);
    if (!company || !plan) return { error: "Not found." };
    company.planName = plan.name;
  } else {
    const { supabase } = await requireAdmin();
    const { error: cancelError } = await supabase
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("company_id", companyId)
      .eq("status", "active");
    if (cancelError) return { error: "Couldn't update the subscription." };

    // Free plans never expire (same as the default subscription created at sign-up);
    // their conversation allowance is counted over the company's whole history.
    const { data: tier } = await supabase
      .from("subscription_tiers")
      .select("monthly_price_jpy")
      .eq("id", tierId)
      .single();
    const isFree = tier?.monthly_price_jpy === 0;

    const start = new Date();
    const { error } = await supabase.from("subscriptions").insert({
      company_id: companyId,
      tier_id: tierId,
      status: "active",
      current_period_start: start.toISOString(),
      current_period_end: addMonths(start, isFree ? 1200 : months).toISOString(),
    });
    if (error) return { error: "Couldn't create the subscription." };
  }

  await logAction("subscription_granted", "company", companyId, { tier_id: tierId, months });
  revalidatePath("/admin", "layout");
  return { success: "Plan updated." };
}

/** Adds months to the company's current subscription period. */
export async function extendPlan(companyId: string, months: number): Promise<AdminResult> {
  if (!Number.isInteger(months) || months < 1 || months > 36)
    return { error: "Choose 1–36 months." };

  if (!isMockMode) {
    const { supabase } = await requireAdmin();
    const now = new Date().toISOString();
    const { data: current } = await supabase
      .from("subscriptions")
      .select("id, current_period_end")
      .eq("company_id", companyId)
      .eq("status", "active")
      .lte("current_period_start", now)
      .gt("current_period_end", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!current) return { error: "This company has no active subscription." };

    const { error } = await supabase
      .from("subscriptions")
      .update({
        current_period_end: addMonths(new Date(current.current_period_end), months).toISOString(),
      })
      .eq("id", current.id);
    if (error) return { error: "Couldn't extend the subscription." };
  }

  await logAction("subscription_extended", "company", companyId, { months });
  revalidatePath("/admin", "layout");
  return { success: "Subscription extended." };
}

/** Cancels the company's active subscriptions (they can't start conversations until granted a plan). */
export async function cancelPlan(companyId: string): Promise<AdminResult> {
  if (isMockMode) {
    const company = mockStore.companies.find((c) => c.id === companyId);
    if (company) company.planName = null;
  } else {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("company_id", companyId)
      .eq("status", "active");
    if (error) return { error: "Couldn't cancel the subscription." };
  }

  await logAction("subscription_canceled", "company", companyId);
  revalidatePath("/admin", "layout");
  return { success: "Subscription canceled." };
}
