"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import type { ProjectFormOptions } from "@/types/projects";
import { createProject, type ProjectActionState } from "@/lib/actions/projects";
import { OptionButton } from "@/components/discovery/OptionButton";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { ReferencesField } from "./ReferencesField";
import { PaymentMethodsPicker } from "@/components/payments/PaymentMethodsPicker";
import { PaymentNotice } from "@/components/payments/PaymentInfo";

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
  const t = useTranslations("app.projects.form");
  const [state, formAction, pending] = useActionState<ProjectActionState, FormData>(
    createProject,
    {},
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <TextField
        label={t("titleLabel")}
        name="title"
        required
        maxLength={120}
        placeholder={t("titlePlaceholder")}
      />
      <TextAreaField
        label={t("descLabel")}
        name="description"
        required
        rows={7}
        maxLength={3000}
        hint={t("descHint")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t("budgetLabel")}
          name="budget"
          required
          inputMode="numeric"
          placeholder="600"
          hint={t("budgetHint")}
        />
        <TextField label={t("deadlineLabel")} name="deadline" type="date" required min={today} />
      </div>
      <ChipPicker legend={t("services")} name="serviceIds" options={options.services} />
      <ChipPicker legend={t("niches")} name="nicheIds" options={options.niches} />
      <ChipPicker legend={t("languages")} name="languageIds" options={options.languages} />
      <ReferencesField />
      <div className="space-y-2">
        <PaymentMethodsPicker legend={t("payLegend")} hint={t("payHint")} />
        <PaymentNotice />
      </div>
      <button type="submit" disabled={pending} className={buttonClass()}>
        {pending ? t("posting") : t("post")}
      </button>
    </form>
  );
}
