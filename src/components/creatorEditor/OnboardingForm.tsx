"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createCreatorProfile, type SaveResult } from "@/lib/actions/creatorProfile";
import { PREFECTURES } from "@/lib/prefectures";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { PersonalDetailsFields } from "./PersonalDetailsFields";

export function OnboardingForm({ suggestedName }: { suggestedName: string }) {
  const t = useTranslations("app.editor.basics");
  const to = useTranslations("app.editor.onboarding");
  const tp = useTranslations("app.prefectures");
  const [suggestedFirstName, ...rest] = suggestedName.trim().split(/\s+/);
  const suggestedLastName = rest.join(" ");
  const [result, formAction, pending] = useActionState<SaveResult, FormData>(
    createCreatorProfile,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      {result.error && <FormMessage tone="error">{result.error}</FormMessage>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t("firstName")}
          name="firstName"
          defaultValue={suggestedFirstName}
          required
          maxLength={60}
          hint={t("firstHint")}
        />
        <TextField
          label={t("lastName")}
          name="lastName"
          defaultValue={suggestedLastName}
          required
          maxLength={60}
          hint={t("lastHint")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={t("prefecture")}
          name="prefecture"
          required
          defaultValue=""
          placeholder={t("choose")}
          options={PREFECTURES.map((p) => ({ value: p, label: tp(p) }))}
        />
        <TextField
          label={t("city")}
          name="city"
          maxLength={80}
          placeholder={t("cityPlaceholder")}
        />
      </div>
      <PersonalDetailsFields birthDate="" gender="" />
      <TextAreaField
        label={t("aboutOptional")}
        name="bio"
        maxLength={1500}
        placeholder={t("aboutPlaceholder")}
      />
      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? to("creating") : to("continue")}
      </button>
    </form>
  );
}
