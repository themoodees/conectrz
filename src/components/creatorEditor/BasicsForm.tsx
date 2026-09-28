"use client";

import { useActionState } from "react";
import type { CreatorEditorData } from "@/types/creatorEditor";
import { updateCreatorBasics, type SaveResult } from "@/lib/actions/creatorProfile";
import { PREFECTURES } from "@/lib/prefectures";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { SaveRow } from "./EditorSection";

/** Name, location, bio and availability. */
export function BasicsForm({ data }: { data: CreatorEditorData }) {
  const [result, formAction, pending] = useActionState<SaveResult, FormData>(
    updateCreatorBasics,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <TextField
        label="Display name"
        name="displayName"
        defaultValue={data.displayName}
        required
        maxLength={80}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Prefecture"
          name="prefecture"
          defaultValue={data.prefecture}
          required
          placeholder="Choose…"
          options={PREFECTURES.map((p) => ({ value: p, label: p }))}
        />
        <TextField
          label="City or area"
          name="city"
          defaultValue={data.city}
          maxLength={80}
          placeholder="e.g. Shibuya"
        />
      </div>
      <TextAreaField
        label="About you"
        name="bio"
        defaultValue={data.bio}
        maxLength={1500}
        rows={5}
        hint="What you create, who you create for, and what brands can expect."
      />
      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          name="isAvailable"
          defaultChecked={data.isAvailable}
          className="size-4 rounded border-border accent-primary"
        />
        Available for new work
      </label>
      <SaveRow pending={pending} result={result} />
    </form>
  );
}
