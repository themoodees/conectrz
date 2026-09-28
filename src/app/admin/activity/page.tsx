import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { getActivity } from "@/lib/data/admin";
import { formatShortDate, formatTime } from "@/lib/format";

export const metadata: Metadata = { title: "Activity · Admin" };

const ACTION_LABELS: Record<string, string> = {
  profile_paused: "Account status changed",
  profile_unpublished: "Profile unpublished",
  account_banned: "Account banned",
  subscription_granted: "Plan switched",
  subscription_extended: "Plan extended",
  subscription_canceled: "Plan canceled",
  subscription_tier_changed: "Plan settings changed",
  category_created: "Category added",
  category_updated: "Category updated",
  category_removed: "Category hidden",
};

export default async function AdminActivityPage() {
  const activity = await getActivity();

  return (
    <PageContainer>
      <AdminPageHeader title="Activity" description="The latest 50 admin actions." />
      {activity.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No admin actions yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-card border border-border">
          {activity.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3 text-sm"
            >
              <span className="font-medium text-ink">
                {ACTION_LABELS[entry.actionType] ?? entry.actionType}
              </span>
              <span className="text-muted">
                {entry.targetType} · {entry.targetId.slice(0, 8)}
              </span>
              {entry.details && (
                <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-graphite">
                  {JSON.stringify(entry.details)}
                </code>
              )}
              <span className="ml-auto text-xs text-muted">
                {formatShortDate(entry.createdAt)} {formatTime(entry.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
