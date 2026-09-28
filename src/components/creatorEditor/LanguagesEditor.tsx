"use client";

import { useState } from "react";
import type { LanguageProficiency } from "@/types/creator";
import type { CategoryOption, CreatorEditorData } from "@/types/creatorEditor";
import { saveLanguages } from "@/lib/actions/creatorProfile";
import { PROFICIENCY_LABELS } from "@/lib/format";
import { buttonClass } from "@/components/ui/buttonStyles";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { SaveRow, rowInputClass, rowRemoveClass } from "./EditorSection";
import { useSave } from "./useSave";

type Row = CreatorEditorData["languages"][number];

/** Languages the creator works in, each with a level. */
export function LanguagesEditor({
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
      <ul className="space-y-2">
        {rows.map((row, index) => (
          <li key={index} className="flex gap-2">
            <select
              aria-label="Language"
              value={row.languageId}
              onChange={(e) => update(index, { languageId: e.target.value })}
              className={rowInputClass}
            >
              <option value="">Language…</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Level"
              value={row.proficiency}
              onChange={(e) =>
                update(index, { proficiency: e.target.value as LanguageProficiency })
              }
              className={`${rowInputClass} sm:max-w-48`}
            >
              {Object.entries(PROFICIENCY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Remove language"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              className={rowRemoveClass}
            >
              <TrashIcon className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() =>
          setRows((current) => [...current, { languageId: "", proficiency: "fluent" }])
        }
        className={buttonClass({ variant: "ghost", size: "sm", className: "mt-3 -ml-3" })}
      >
        <PlusIcon className="size-4" />
        Add language
      </button>
      <SaveRow pending={pending} result={result} onSave={() => save(() => saveLanguages(rows))} />
    </div>
  );
}
