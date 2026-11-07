"use client";

import { useTranslations } from "next-intl";
import type { DiscoveryLabels } from "@/lib/discovery/applyFilters";

/** Translated names for the filters, genders and follower ranges. */
export function useDiscoveryLabels(): DiscoveryLabels {
  const t = useTranslations("app.discovery");
  const tGender = useTranslations("app.gender");
  return {
    filter: {
      niches: t("filterLabels.niches"),
      locations: t("filterLabels.locations"),
      languages: t("filterLabels.languages"),
      platforms: t("filterLabels.platforms"),
      services: t("filterLabels.services"),
      price: t("filterLabels.price"),
      age: t("filterLabels.age"),
      gender: t("filterLabels.gender"),
      followers: t("filterLabels.followers"),
      availability: t("filterLabels.availability"),
    },
    gender: { woman: tGender("woman"), man: tGender("man"), other: tGender("other") },
    follower: {
      "under-10k": t("followerRanges.under-10k"),
      "10k-50k": t("followerRanges.10k-50k"),
      "50k-100k": t("followerRanges.50k-100k"),
      "100k-plus": t("followerRanges.100k-plus"),
    },
    availableNow: t("availableNow"),
  };
}
