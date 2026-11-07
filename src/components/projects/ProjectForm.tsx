"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import type { ProjectFormInitial, ProjectFormOptions } from "@/types/projects";
import { createProject, updateProject, type ProjectActionState } from "@/lib/actions/projects";
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
  initial = [],
}: {
  legend: string;
  name: string;
  options: { id: string; name: string }[];
  initial?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initial);
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

/** "Post a project" form; with `initial` it edits that project instead. */
export function ProjectForm({
  options,
  initial,
}: {
  options: ProjectFormOptions;
  initial?: ProjectFormInitial;
}) {
  const t = useTranslations("app.projects.form");
  const [state, formAction, pending] = useActionState<ProjectActionState, FormData>(
    initial ? updateProject : createProject,
    {},
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-6">
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {initial && <input type="hidden" name="projectId" value={initial.id} />}
      <TextField
        label={t("titleLabel")}
        name="title"
        defaultValue={initial?.title}
        required
        maxLength={120}
        placeholder={t("titlePlaceholder")}
      />
      <TextAreaField
        label={t("descLabel")}
        name="description"
        defaultValue={initial?.description}
        required
        rows={7}
        maxLength={3000}
        hint={t("descHint")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t("budgetLabel")}
          name="budget"
          defaultValue={initial?.budgetUsd}
          required
          inputMode="numeric"
          placeholder="600"
          hint={t("budgetHint")}
        />
        <TextField
          label={t("deadlineLabel")}
          name="deadline"
          type="date"
          required
          min={today}
          defaultValue={initial?.deliveryDeadline}
        />
      </div>
      <ChipPicker
        legend={t("services")}
        name="serviceIds"
        options={options.services}
        initial={initial?.serviceIds}
      />
      <ChipPicker
        legend={t("niches")}
        name="nicheIds"
        options={options.niches}
        initial={initial?.nicheIds}
      />
      <ChipPicker
        legend={t("languages")}
        name="languageIds"
        options={options.languages}
        initial={initial?.languageIds}
      />
      <ReferencesField
        initialLinks={initial?.referenceLinks}
        initialImages={initial?.referenceImages}
      />
      <div className="space-y-2">
        <PaymentMethodsPicker
          legend={t("payLegend")}
          hint={t("payHint")}
          initial={initial?.paymentMethods}
        />
        <PaymentNotice />
      </div>
      <button type="submit" disabled={pending} className={buttonClass()}>
        {initial ? (pending ? t("saving") : t("save")) : pending ? t("posting") : t("post")}
      </button>
    </form>
  );
}
