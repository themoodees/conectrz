import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReminderPanel } from "@/components/admin/ReminderPanel";
import { PageContainer } from "@/components/layout/PageContainer";
import { getReminderCounts } from "@/lib/actions/admin";

export const metadata: Metadata = { title: "Reminders · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminRemindersPage() {
  const counts = await getReminderCounts();

  return (
    <PageContainer>
      <AdminPageHeader
        title="Profile reminders"
        description="One email to creators who signed up but can't be found by companies yet."
      />
      {!counts ? (
        <p className="py-10 text-center text-sm text-muted">Couldn&apos;t load the numbers.</p>
      ) : (
        <div className="max-w-2xl space-y-5">
          <ul className="divide-y divide-border rounded-card border border-border text-sm">
            <li className="flex justify-between px-5 py-3">
              <span>Profile created but hidden (missing prefecture, language or service)</span>
              <span className="font-semibold text-ink">{counts.hidden_profile}</span>
            </li>
            <li className="flex justify-between px-5 py-3">
              <span>Confirmed email, never created a profile</span>
              <span className="font-semibold text-ink">{counts.no_profile}</span>
            </li>
            <li className="flex justify-between px-5 py-3 font-semibold text-ink">
              <span>Will receive the reminder</span>
              <span>{counts.total}</span>
            </li>
          </ul>
          <p className="text-sm text-muted">
            Language follows each creator&apos;s setting (English by default). Everyone gets it once
            only. Creators who didn&apos;t confirm their email are not included. &quot;Send test&quot;
            emails the 4 versions to your own address only.
          </p>
          <ReminderPanel total={counts.total} />
        </div>
      )}
    </PageContainer>
  );
}
