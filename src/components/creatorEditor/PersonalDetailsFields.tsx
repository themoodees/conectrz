import { useTranslations } from "next-intl";
import { GENDER_OPTIONS } from "@/lib/discovery/filterConfig";
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
  const t = useTranslations("app.editor.personal");
  const tg = useTranslations("app.gender");
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        label={t("birth")}
        name="birthDate"
        type="date"
        defaultValue={birthDate}
        max={new Date().toISOString().slice(0, 10)}
        hint={t("birthHint")}
      />
      <SelectField
        label={t("gender")}
        name="gender"
        defaultValue={gender}
        placeholder={t("preferNot")}
        options={GENDER_OPTIONS.map((g) => ({ value: g, label: tg(g) }))}
      />
    </div>
  );
}
