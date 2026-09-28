import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PlanEditor } from "@/components/admin/PlanEditor";
import { PageContainer } from "@/components/layout/PageContainer";
import { getPlans } from "@/lib/data/plans";

export const metadata: Metadata = { title: "Plans · Admin" };

export default async function AdminPlansPage() {
  const plans = await getPlans({ includeInactive: true });

  return (
    <PageContainer>
      <AdminPageHeader
        title="Plans"
        description="Prices and conversation limits. Changes apply immediately to companies on each plan. Assign plans to companies under Accounts → Companies."
      />
      <ul className="divide-y divide-border rounded-card border border-border px-5">
        {plans.map((plan) => (
          <PlanEditor key={plan.id} plan={plan} />
        ))}
        <PlanEditor />
      </ul>
    </PageContainer>
  );
}
