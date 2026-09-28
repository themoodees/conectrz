"use client";

import { useState, useTransition } from "react";
import type { AdminCategory, CategoryTable } from "@/types/admin";
import { createCategory, updateCategory, type AdminResult } from "@/lib/actions/admin";
import { buttonClass } from "@/components/ui/buttonStyles";
import { rowInputClass } from "@/components/creatorEditor/EditorSection";

/** One category list (niches, languages or services): add, rename, hide/show. */
export function CategoryManager({
  table,
  title,
  categories,
}: {
  table: CategoryTable;
  title: string;
  categories: AdminCategory[];
}) {
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminResult>({});

  const run = (action: () => Promise<AdminResult>, onSuccess?: () => void) =>
    startTransition(async () => {
      const outcome = await action();
      setResult(outcome);
      if (!outcome.error) onSuccess?.();
    });

  return (
    <section className="rounded-card border border-border p-5">
      <h2 className="font-sans text-base font-semibold tracking-normal text-ink">{title}</h2>
      <p className="mt-1 text-xs text-muted">
        Hidden items stay on existing profiles but can&apos;t be newly chosen.
      </p>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          run(
            () => createCategory(table, newName),
            () => setNewName(""),
          );
        }}
      >
        <input
          aria-label={`New ${title.toLowerCase()} name`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add new…"
          maxLength={60}
          className={rowInputClass}
        />
        <button
          type="submit"
          disabled={pending || !newName.trim()}
          className={buttonClass({ size: "sm", className: "h-10" })}
        >
          Add
        </button>
      </form>
      {result.error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {result.error}
        </p>
      )}

      <ul className="mt-4 divide-y divide-border">
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            disabled={pending}
            onRename={(name) => run(() => updateCategory(table, category.id, { name }))}
            onToggle={() =>
              run(() => updateCategory(table, category.id, { isActive: !category.isActive }))
            }
          />
        ))}
      </ul>
    </section>
  );
}

function CategoryRow({
  category,
  disabled,
  onRename,
  onToggle,
}: {
  category: AdminCategory;
  disabled: boolean;
  onRename: (name: string) => void;
  onToggle: () => void;
}) {
  const [name, setName] = useState(category.name);
  const changed = name.trim() !== category.name;

  return (
    <li className="flex items-center gap-2 py-2">
      <input
        aria-label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={`${rowInputClass} h-9 ${category.isActive ? "" : "text-muted line-through"}`}
      />
      {changed && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRename(name)}
          className={buttonClass({ size: "sm" })}
        >
          Save
        </button>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={buttonClass({ variant: "ghost", size: "sm", className: "w-16 shrink-0" })}
      >
        {category.isActive ? "Hide" : "Show"}
      </button>
    </li>
  );
}
