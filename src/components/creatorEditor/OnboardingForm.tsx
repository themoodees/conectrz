"use client";

import { useActionState } from "react";
import { createCreatorProfile, type SaveResult } from "@/lib/actions/creatorProfile";
import { PREFECTURES } from "@/lib/prefectures";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";

export function OnboardingForm({ suggestedName }: { suggestedName: string }) {
  const [result, formAction, pending] = useActionState<SaveResult, FormData>(
    createCreatorProfile,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      {result.error && <FormMessage tone="error">{result.error}</FormMessage>}
      <TextField
        label="Display name"
        name="displayName"
        defaultValue={suggestedName}
        required
        maxLength={80}
        hint="Shown to brands on your profile."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Prefecture"
          name="prefecture"
          required
          defaultValue=""
          placeholder="Choose…"
          options={PREFECTURES.map((p) => ({ value: p, label: p }))}
        />
        <TextField label="City or area" name="city" maxLength={80} placeholder="e.g. Shibuya" />
      </div>
      <TextAreaField
        label="About you (optional)"
        name="bio"
        maxLength={1500}
        placeholder="What you create and who you create for."
      />
      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? "Creating profile…" : "Continue"}
      </button>
    </form>
  );
}
