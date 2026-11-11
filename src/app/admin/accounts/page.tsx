import type { Metadata } from "next";
import { AccountList } from "@/components/admin/AccountList";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Pagination } from "@/components/ui/Pagination";
import { getAccounts } from "@/lib/data/admin";
import { getPlans } from "@/lib/data/plans";
import { PAGE_SIZE, paginate, parsePage } from "@/lib/pagination";

export const metadata: Metadata = { title: "Accounts · Admin" };

export default async function AdminAccountsPage({ searchParams }: PageProps<"/admin/accounts">) {
  const [{ tab, page: pageParam }, accounts, plans] = await Promise.all([searchParams, getAccounts(), getPlans()]);
  const showCompanies = tab === "companies";
  const list = showCompanies ? accounts.companies : accounts.creators;
  const paged = paginate(list, parsePage(pageParam), PAGE_SIZE.accounts);
  const hrefFor = (n: number) =>
    `/admin/accounts?${showCompanies ? "tab=companies&" : ""}page=${n}`;

  return (
    <PageContainer>
      <AdminPageHeader
        title="Accounts"
        description="Pause, ban, reactivate or permanently delete accounts. Companies' plans are managed here too."
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
        <>
          <AccountList
            key={`${showCompanies ? "companies" : "creators"}-${paged.page}`}
            accounts={paged.items}
            plans={plans}
          />
          <Pagination page={paged.page} totalPages={paged.totalPages} hrefFor={hrefFor} />
        </>
      )}
    </PageContainer>
  );
}
