"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { loadMunicipalities, municipalityLabel, type Municipality } from "@/lib/municipalities";
import { PREFECTURES } from "@/lib/prefectures";
import { countryOptions, HOME_COUNTRY } from "@/lib/countries";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";

const OTHER = "other";

/**
 * Prefecture + city/ward. The city is picked from the official list for that prefecture, so it
 * can be shown in every language; "Other" lets someone type a place that isn't listed.
 * Submits `prefecture`, `cityCode` ("other" or a 5-digit code) and, for "Other", `city`.
 * Country comes first (Japan by default). Outside Japan only the country is asked.
 */
export function LocationFields({
  defaultCountryCode = HOME_COUNTRY,
  defaultPrefecture = "",
  defaultCityCode = "",
  defaultCity = "",
}: {
  defaultCountryCode?: string;
  defaultPrefecture?: string;
  defaultCityCode?: string;
  defaultCity?: string;
}) {
  const t = useTranslations("app.editor.basics");
  const tp = useTranslations("app.prefectures");
  const locale = useLocale();
  const [countryCode, setCountryCode] = useState(defaultCountryCode || HOME_COUNTRY);
  const [prefecture, setPrefecture] = useState(defaultPrefecture);
  const [cityCode, setCityCode] = useState(defaultCityCode || (defaultCity ? OTHER : ""));
  const [loaded, setLoaded] = useState<{ prefecture: string; list: Municipality[] } | null>(null);

  useEffect(() => {
    if (!prefecture) return;
    let cancelled = false;
    loadMunicipalities(prefecture).then((list) => {
      if (!cancelled) setLoaded({ prefecture, list });
    });
    return () => {
      cancelled = true;
    };
  }, [prefecture]);

  const list = loaded?.prefecture === prefecture ? loaded.list : [];
  const options = [
    ...list.map((m) => ({ value: m.c, label: municipalityLabel(m, locale) })),
    ...(prefecture ? [{ value: OTHER, label: t("cityOther") }] : []),
  ];

  // Outside Japan only the country is asked: no prefecture, no city.
  if (countryCode !== HOME_COUNTRY) {
    return (
      <SelectField
        label={t("country")}
        name="countryCode"
        value={countryCode}
        onChange={(event) => setCountryCode(event.target.value)}
        options={countryOptions(locale)}
      />
    );
  }

  return (
    <>
      <SelectField
        label={t("country")}
        name="countryCode"
        value={countryCode}
        onChange={(event) => setCountryCode(event.target.value)}
        options={countryOptions(locale)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={t("prefecture")}
          name="prefecture"
          value={prefecture}
          onChange={(event) => {
            setPrefecture(event.target.value);
            setCityCode("");
          }}
          required
          placeholder={t("choose")}
          options={PREFECTURES.map((p) => ({ value: p, label: tp(p) }))}
        />
        <div>
          <SelectField
            label={t("city")}
            name="cityCode"
            value={prefecture ? cityCode : ""}
            onChange={(event) => setCityCode(event.target.value)}
            disabled={!prefecture}
            placeholder={prefecture ? t("choose") : t("cityPrefectureFirst")}
            options={options}
          />
        </div>
      </div>
      {prefecture && cityCode === OTHER && (
        <TextField
          label={t("cityOtherLabel")}
          name="city"
          defaultValue={defaultCityCode ? "" : defaultCity}
          maxLength={80}
          placeholder={t("cityPlaceholder")}
        />
      )}
    </>
  );
}
