"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { CreatorEditorData } from "@/types/creatorEditor";
import { updateCreatorBasics, type SaveResult } from "@/lib/actions/creatorProfile";
import { PREFECTURES } from "@/lib/prefectures";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { SaveRow } from "./EditorSection";
import { PersonalDetailsFields } from "./PersonalDetailsFields";

/** Name, location, bio and availability. */
export function BasicsForm({ data }: { data: CreatorEditorData }) {
  const t = useTranslations("app.editor.basics");
  const tp = useTranslations("app.prefectures");
  const [result, formAction, pending] = useActionState<SaveResult, FormData>(
    updateCreatorBasics,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t("firstName")}
          name="firstName"
          defaultValue={data.firstName}
          required
          maxLength={60}
          hint={t("firstHint")}
        />
        <TextField
          label={t("lastName")}
          name="lastName"
          defaultValue={data.lastName}
          required
          maxLength={60}
          hint={t("lastHint")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={t("prefecture")}
          name="prefecture"
          defaultValue={data.prefecture}
          required
          placeholder={t("choose")}
          options={PREFECTURES.map((p) => ({ value: p, label: tp(p) }))}
        />
        <TextField
          label={t("city")}
          name="city"
          defaultValue={data.city}
          maxLength={80}
          placeholder={t("cityPlaceholder")}
        />
      </div>
      <PersonalDetailsFields birthDate={data.birthDate} gender={data.gender} />
      <TextAreaField
        label={t("about")}
        name="bio"
        defaultValue={data.bio}
        maxLength={1500}
        rows={5}
        hint={t("aboutHint")}
      />
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          name="isAvailable"
          defaultChecked={data.isAvailable}
          className="size-4 rounded border-border accent-primary"
        />
        {t("available")}
      </label>
      <SaveRow pending={pending} result={result} />
    </form>
  );
}
