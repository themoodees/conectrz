"use client";

import { useState } from "react";
import type { CategoryOption } from "@/types/creatorEditor";
import { saveNiches } from "@/lib/actions/creatorProfile";
import { OptionButton } from "@/components/discovery/OptionButton";
import { SaveRow } from "./EditorSection";
import { useSave } from "./useSave";

const MAX_NICHES = 5;

/** Pick up to five niches. */
export function NichesEditor({
  options,
  initialIds,
}: {
  options: CategoryOption[];
  initialIds: string[];
}) {
  const [selected, setSelected] = useState(initialIds);
  const { save, pending, result } = useSave();

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : current.length < MAX_NICHES
          ? [...current, id]
          : current,
    );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <OptionButton
            key={option.id}
            label={option.name}
            isSelected={selected.includes(option.id)}
            onClick={() => toggle(option.id)}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        {selected.length} of {MAX_NICHES} selected
      </p>
      <SaveRow pending={pending} result={result} onSave={() => save(() => saveNiches(selected))} />
    </div>
  );
}
