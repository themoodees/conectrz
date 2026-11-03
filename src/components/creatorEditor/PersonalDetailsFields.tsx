import { GENDER_LABELS, GENDER_OPTIONS } from "@/lib/discovery/filterConfig";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";

/** Optional birth date and gender. Brands only ever see the calculated age. */
export function PersonalDetailsFields({
  birthDate,
  gender,
}: {
  birthDate: string;
  gender: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        label="Birth date (optional)"
        name="birthDate"
        type="date"
        defaultValue={birthDate}
        max={new Date().toISOString().slice(0, 10)}
        hint="Private. Brands only see your age, so they can filter by it."
      />
      <SelectField
        label="Gender (optional)"
        name="gender"
        defaultValue={gender}
        placeholder="Prefer not to say"
        options={GENDER_OPTIONS.map((g) => ({ value: g, label: GENDER_LABELS[g] }))}
      />
    </div>
  );
}
