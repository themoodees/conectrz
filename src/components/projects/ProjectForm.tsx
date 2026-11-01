"use client";

import { useActionState, useState } from "react";
import type { ProjectFormOptions } from "@/types/projects";
import { createProject, type ProjectActionState } from "@/lib/actions/projects";
import { OptionButton } from "@/components/discovery/OptionButton";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";

/** Chip picker that submits its choices as repeated hidden inputs. */
function ChipPicker({
  legend,
  name,
  options,
}: {
  legend: string;
  name: string;
  options: { id: string; name: string }[];
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-ink">{legend}</legend>
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
      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </fieldset>
  );
}

/** "Post a project" form. */
export function ProjectForm({ options }: { options: ProjectFormOptions }) {
  const [state, formAction, pending] = useActionState<ProjectActionState, FormData>(
    createProject,
    {},
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <TextField
        label="Project title"
        name="title"
        required
        maxLength={120}
        placeholder="e.g. Autumn skincare UGC videos"
      />
      <TextAreaField
        label="What do you need?"
        name="description"
        required
        rows={7}
        maxLength={3000}
        hint="Describe the deliverables, style, how many, and anything creators should know."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Budget (USD)"
          name="budget"
          required
          inputMode="numeric"
          placeholder="600"
          hint="Whole US dollars."
        />
        <TextField label="Deliver by" name="deadline" type="date" required min={today} />
      </div>
      <ChipPicker legend="Services wanted" name="serviceIds" options={options.services} />
      <ChipPicker legend="Niches" name="nicheIds" options={options.niches} />
      <ChipPicker legend="Languages" name="languageIds" options={options.languages} />
      <button type="submit" disabled={pending} className={buttonClass()}>
        {pending ? "Posting…" : "Post project"}
      </button>
    </form>
  );
}
