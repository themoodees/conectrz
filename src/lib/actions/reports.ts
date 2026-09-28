"use server";

import type { Database } from "@/lib/supabase/database.types";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";

export type ReportReason = Database["public"]["Enums"]["report_reason"];
export type ReportTargetType = "creator" | "company" | "conversation";

export interface ReportState {
  error?: string;
  done?: boolean;
}

const REASONS: ReportReason[] = [
  "fake_profile",
  "spam",
  "inappropriate_content",
  "harassment",
  "no_response",
  "other",
];

/** Files a report for admins to review. Exactly one target per report. */
export async function submitReport(
  _previous: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const targetType = String(formData.get("targetType") ?? "") as ReportTargetType;
  const targetId = String(formData.get("targetId") ?? "");
  const reason = String(formData.get("reason") ?? "") as ReportReason;
  const details =
    String(formData.get("details") ?? "")
      .trim()
      .slice(0, 2000) || null;

  if (!["creator", "company", "conversation"].includes(targetType) || !targetId) {
    return { error: "Something went wrong. Please try again." };
  }
  if (!REASONS.includes(reason)) return { error: "Choose a reason." };

  if (isMockMode) return { done: true };

  const { supabase, user } = await requireSupabaseUser();
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reason,
    details,
    target_creator_id: targetType === "creator" ? targetId : null,
    target_company_id: targetType === "company" ? targetId : null,
    target_conversation_id: targetType === "conversation" ? targetId : null,
  });
  if (error) return { error: "Your report couldn't be sent. Please try again." };
  return { done: true };
}
