"use client";

import { useState } from "react";
import type { RateType } from "@/types/creator";
import type { CategoryOption, CreatorEditorData } from "@/types/creatorEditor";
import { saveServices } from "@/lib/actions/creatorProfile";
import { buttonClass } from "@/components/ui/buttonStyles";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { SaveRow, rowInputClass, rowRemoveClass } from "./EditorSection";
import { useSave } from "./useSave";

type Row = CreatorEditorData["services"][number];

/** Services the creator offers, with a flat or "starting from" rate in yen. */
export function ServicesEditor({
  options,
  initialRows,
}: {
  options: CategoryOption[];
  initialRows: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const { save, pending, result } = useSave();

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <div>
      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li
            key={index}
            className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_11rem_9rem_auto]"
          >
            <select
              aria-label="Service"
              value={row.serviceId}
              onChange={(e) => update(index, { serviceId: e.target.value })}
              className={`${rowInputClass} col-span-1`}
            >
              <option value="">Service…</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Remove service"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              className={`${rowRemoveClass} sm:order-last`}
            >
              <TrashIcon className="size-4" />
            </button>
            <select
              aria-label="Rate type"
              value={row.rateType}
              onChange={(e) => update(index, { rateType: e.target.value as RateType })}
              className={rowInputClass}
            >
              <option value="starting_from">Starting from</option>
              <option value="flat">Flat rate</option>
            </select>
            <label className="relative">
              <span className="sr-only">Rate in yen</span>
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">
                ¥
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={row.rateAmountJpy || ""}
                onChange={(e) => update(index, { rateAmountJpy: Number(e.target.value) })}
                placeholder="30000"
                className={`${rowInputClass} pl-7`}
              />
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() =>
          setRows((current) => [
            ...current,
            { serviceId: "", rateType: "starting_from", rateAmountJpy: 0 },
          ])
        }
        className={buttonClass({ variant: "ghost", size: "sm", className: "mt-3 -ml-3" })}
      >
        <PlusIcon className="size-4" />
        Add service
      </button>
      <SaveRow pending={pending} result={result} onSave={() => save(() => saveServices(rows))} />
    </div>
  );
}
