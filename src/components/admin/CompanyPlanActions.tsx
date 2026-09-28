"use client";

import { useState, useTransition } from "react";
import type { Plan } from "@/types/plans";
import { cancelPlan, extendPlan, grantPlan, type AdminResult } from "@/lib/actions/admin";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { Modal } from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/SelectField";

/** "Manage plan" dialog for a company: switch plan, extend or cancel. */
export function CompanyPlanActions({
  companyId,
  companyName,
  currentPlanName,
  plans,
}: {
  companyId: string;
  companyName: string;
  currentPlanName: string | null;
  plans: Plan[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tierId, setTierId] = useState(plans[0]?.id ?? "");
  const [months, setMonths] = useState("1");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminResult>({});

  const run = (action: () => Promise<AdminResult>) =>
    startTransition(async () => setResult(await action()));

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setResult({});
          setIsOpen(true);
        }}
        className={buttonClass({ variant: "secondary", size: "sm" })}
      >
        Manage plan
      </button>
      <Modal title={`Plan for ${companyName}`} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="space-y-5">
          <p className="text-sm text-graphite">
            Current plan:{" "}
            <span className="font-semibold text-ink">{currentPlanName ?? "None"}</span>
          </p>
          {result.error && <FormMessage tone="error">{result.error}</FormMessage>}
          {result.success && <FormMessage tone="success">{result.success}</FormMessage>}

          <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
            <SelectField
              label="Switch to plan"
              name="tier"
              value={tierId}
              onChange={(e) => setTierId(e.target.value)}
              options={plans.map((p) => ({ value: p.id, label: p.name }))}
            />
            <SelectField
              label="Length"
              name="months"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              options={[1, 3, 6, 12].map((m) => ({ value: String(m), label: `${m} mo` }))}
            />
          </div>
          <p className="-mt-2 text-xs text-muted">
            Starts a new period today; the conversation count resets.
          </p>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <button
              type="button"
              disabled={pending || !tierId}
              onClick={() => run(() => grantPlan(companyId, tierId, Number(months)))}
              className={buttonClass({ size: "sm" })}
            >
              Switch plan
            </button>
            <button
              type="button"
              disabled={pending || !currentPlanName}
              onClick={() => run(() => extendPlan(companyId, Number(months)))}
              className={buttonClass({ variant: "secondary", size: "sm" })}
            >
              Extend current by {months} mo
            </button>
            <button
              type="button"
              disabled={pending || !currentPlanName}
              onClick={() => {
                if (window.confirm(`Cancel ${companyName}'s plan?`))
                  run(() => cancelPlan(companyId));
              }}
              className={buttonClass({ variant: "danger", size: "sm" })}
            >
              Cancel plan
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
