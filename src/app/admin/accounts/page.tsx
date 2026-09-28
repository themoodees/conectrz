import type { Metadata } from "next";
import { AccountStatusActions } from "@/components/admin/AdminActionButtons";
import { AdminPageHeader, StatusBadge } from "@/components/admin/AdminPageHeader";
import { CompanyPlanActions } from "@/components/admin/CompanyPlanActions";
import { PageContainer } from "@/components/layout/PageContainer";
import { getAccounts } from "@/lib/data/admin";
import { getPlans } from "@/lib/data/plans";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Accounts · Admin" };

export default async function AdminAccountsPage({ searchParams }: PageProps<"/admin/accounts">) {
  const [{ tab }, accounts, plans] = await Promise.all([searchParams, getAccounts(), getPlans()]);
  const showCompanies = tab === "companies";
  const list = showCompanies ? accounts.companies : accounts.creators;

  return (
    <PageContainer>
      <AdminPageHeader
        title="Accounts"
        description="Pause, ban or reactivate accounts. Companies' plans are managed here too."
        tabs={[
          {
            label: "Creators",
            href: "/admin/accounts",
            isActive: !showCompanies,
            count: accounts.creators.length,
          },
          {
            label: "Companies",
            href: "/admin/accounts?tab=companies",
            isActive: showCompanies,
            count: accounts.companies.length,
          },
        ]}
      />

      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No accounts yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-card border border-border">
          {list.map((account) => (
            <li key={account.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
              <div className="min-w-0 flex-1 basis-60">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-ink">{account.name}</span>
                  <StatusBadge status={account.status} />
                </div>
                <p className="truncate text-sm text-muted">
                  {account.detail} · joined {formatShortDate(account.createdAt)}
                </p>
              </div>
              {account.kind === "company" && (
                <div className="text-sm">
                  <span className="text-muted">Plan: </span>
                  <span className="font-medium text-ink">{account.planName ?? "None"}</span>
                  {account.planPeriodEnd && (
                    <span className="text-muted">
                      {" "}
                      · until {formatShortDate(account.planPeriodEnd)}
                    </span>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {account.kind === "company" && (
                  <CompanyPlanActions
                    companyId={account.id}
                    companyName={account.name}
                    currentPlanName={account.planName ?? null}
                    plans={plans}
                  />
                )}
                <AccountStatusActions
                  kind={account.kind}
                  accountId={account.id}
                  name={account.name}
                  status={account.status}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
