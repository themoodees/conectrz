"use client";

import { useState, useTransition } from "react";
import type { Plan } from "@/types/plans";
import { savePlan, type AdminResult } from "@/lib/actions/admin";
import { buttonClass } from "@/components/ui/buttonStyles";
import { rowInputClass } from "@/components/creatorEditor/EditorSection";

type Draft = Omit<Plan, "id"> & { id?: string };

const EMPTY: Draft = { name: "", monthlyPriceJpy: 0, conversationQuota: 0, isActive: true };

/** Editable row for a plan (or a blank row to add one). */
export function PlanEditor({ plan }: { plan?: Plan }) {
  const [draft, setDraft] = useState<Draft>(plan ?? EMPTY);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminResult>({});

  const set = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  return (
    <li className="grid grid-cols-2 items-end gap-3 py-4 sm:grid-cols-[1fr_9rem_9rem_6rem_auto]">
      <label className="col-span-2 text-xs font-medium text-muted sm:col-span-1">
        Name
        <input
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Plan name"
          className={`${rowInputClass} mt-1`}
        />
      </label>
      <label className="text-xs font-medium text-muted">
        ¥ / month
        <input
          type="number"
          min={0}
          value={draft.monthlyPriceJpy}
          onChange={(e) => set({ monthlyPriceJpy: Number(e.target.value) })}
          className={`${rowInputClass} mt-1`}
        />
      </label>
      <label className="text-xs font-medium text-muted">
        Conversations / period
        <input
          type="number"
          min={0}
          value={draft.conversationQuota}
          onChange={(e) => set({ conversationQuota: Number(e.target.value) })}
          className={`${rowInputClass} mt-1`}
        />
      </label>
      <label className="flex h-10 items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(e) => set({ isActive: e.target.checked })}
          className="size-4 accent-primary"
        />
        Active
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const outcome = await savePlan(draft);
              setResult(outcome);
              if (!outcome.error && !plan) setDraft(EMPTY);
            })
          }
          className={buttonClass({ size: "sm", className: "h-10" })}
        >
          {plan ? "Save" : "Add plan"}
        </button>
      </div>
      {(result.error || result.success) && (
        <p
          role={result.error ? "alert" : "status"}
          className={`col-span-full text-xs ${result.error ? "text-danger" : "text-graphite"}`}
        >
          {result.error ?? result.success}
        </p>
      )}
    </li>
  );
}
