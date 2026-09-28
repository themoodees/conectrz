import type { Metadata } from "next";
import { AdminPageHeader, StatusBadge } from "@/components/admin/AdminPageHeader";
import { ReportActions } from "@/components/admin/AdminActionButtons";
import { PageContainer } from "@/components/layout/PageContainer";
import { REPORT_REASON_LABELS } from "@/components/reports/ReportDialog";
import { getReports } from "@/lib/data/admin";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Reports · Admin" };

export default async function AdminReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const [{ view }, reports] = await Promise.all([searchParams, getReports()]);
  const showResolved = view === "resolved";
  const pending = reports.filter((r) => r.status === "pending");
  const resolved = reports.filter((r) => r.status === "resolved");
  const visible = showResolved ? resolved : pending;

  return (
    <PageContainer>
      <AdminPageHeader
        title="Reports"
        description="Reports filed by companies and creators."
        tabs={[
          {
            label: "Pending",
            href: "/admin/reports",
            isActive: !showResolved,
            count: pending.length,
          },
          {
            label: "Resolved",
            href: "/admin/reports?view=resolved",
            isActive: showResolved,
            count: resolved.length,
          },
        ]}
      />

      {visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          {showResolved ? "No resolved reports yet." : "No pending reports. 🎉"}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((report) => (
            <li key={report.id} className="rounded-card border border-border p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">
                  {REPORT_REASON_LABELS[report.reason] ?? report.reason}
                </span>
                <StatusBadge status={report.resolution ?? report.status} />
                <span className="ml-auto text-xs text-muted">
                  {formatShortDate(report.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-graphite">{report.targetLabel}</p>
              <p className="text-xs text-muted">Reported by {report.reporterName}</p>
              {report.details && (
                <p className="mt-3 rounded-control bg-surface px-3 py-2 text-sm text-graphite">
                  {report.details}
                </p>
              )}
              {report.status === "pending" && (
                <div className="mt-4">
                  <ReportActions reportId={report.id} target={report.actionTarget} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
