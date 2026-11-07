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
  const [newNameJa, setNewNameJa] = useState("");
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
        Hidden items stay on existing profiles but can&apos;t be newly chosen. The Japanese name is
        what Japanese-language visitors see; if it is empty they see the English name.
      </p>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          run(
            () => createCategory(table, newName, newNameJa),
            () => {
              setNewName("");
              setNewNameJa("");
            },
          );
        }}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <input
            aria-label={`New ${title.toLowerCase()} name`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add new (English)…"
            maxLength={60}
            className={rowInputClass}
          />
          <input
            aria-label={`New ${title.toLowerCase()} name in Japanese`}
            value={newNameJa}
            onChange={(e) => setNewNameJa(e.target.value)}
            placeholder="日本語 (optional)"
            maxLength={60}
            className={rowInputClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending || !newName.trim()}
          className={buttonClass({ size: "sm", className: "h-10 self-start" })}
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
            onSave={(changes) => run(() => updateCategory(table, category.id, changes))}
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
  onSave,
  onToggle,
}: {
  category: AdminCategory;
  disabled: boolean;
  onSave: (changes: { name?: string; nameJa?: string }) => void;
  onToggle: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [nameJa, setNameJa] = useState(category.nameJa ?? "");
  const nameChanged = name.trim() !== category.name;
  const jaChanged = nameJa.trim() !== (category.nameJa ?? "");

  return (
    <li className="flex items-start gap-2 py-2">
      <div className="min-w-0 flex-1 space-y-1">
        <input
          aria-label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${rowInputClass} h-9 ${category.isActive ? "" : "text-muted line-through"}`}
        />
        <input
          aria-label="Name in Japanese"
          value={nameJa}
          onChange={(e) => setNameJa(e.target.value)}
          placeholder="日本語"
          maxLength={60}
          className={`${rowInputClass} h-9 text-sm ${category.isActive ? "" : "text-muted"}`}
        />
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        {(nameChanged || jaChanged) && (
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onSave({
                ...(nameChanged ? { name } : {}),
                ...(jaChanged ? { nameJa } : {}),
              })
            }
            className={buttonClass({ size: "sm", className: "w-16" })}
          >
            Save
          </button>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          className={buttonClass({ variant: "ghost", size: "sm", className: "w-16" })}
        >
          {category.isActive ? "Hide" : "Show"}
        </button>
      </div>
    </li>
  );
}
