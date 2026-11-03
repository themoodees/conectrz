"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  DiscoveryFilters,
  FilterKey,
  FollowerRangeId,
  MultiSelectFilterKey,
  NumberRange,
} from "@/types/discovery";
import type { Gender } from "@/types/creator";
import type { ActiveFilterChip } from "@/lib/discovery/applyFilters";
import { EMPTY_FILTERS, isMultiSelectFilter } from "@/lib/discovery/filterConfig";

export interface FilterActions {
  toggleValue: (key: MultiSelectFilterKey, value: string) => void;
  setPrice: (price: NumberRange | null) => void;
  setAge: (age: NumberRange | null) => void;
  toggleGender: (gender: Gender) => void;
  setFollowers: (followers: FollowerRangeId | null) => void;
  setAvailableOnly: (availableOnly: boolean) => void;
  removeChip: (chip: ActiveFilterChip) => void;
  /** Clears the given filters, or everything when no keys are passed. */
  clear: (keys?: FilterKey[]) => void;
}

function resetKey(filters: DiscoveryFilters, key: FilterKey): DiscoveryFilters {
  if (isMultiSelectFilter(key)) return { ...filters, [key]: [] };
  if (key === "gender") return { ...filters, genders: [] };
  if (key === "availability") return { ...filters, availableOnly: false };
  return { ...filters, [key]: null };
}

/** Filter state + the actions that change it. */
export function useDiscoveryFilters() {
  const [filters, setFilters] = useState<DiscoveryFilters>(EMPTY_FILTERS);

  const toggleValue = useCallback((key: MultiSelectFilterKey, value: string) => {
    setFilters((current) => {
      const values = current[key] as string[];
      const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
      return { ...current, [key]: next };
    });
  }, []);

  const clear = useCallback((keys?: FilterKey[]) => {
    setFilters((current) => (keys ? keys.reduce(resetKey, current) : EMPTY_FILTERS));
  }, []);

  const actions: FilterActions = useMemo(
    () => ({
      toggleValue,
      clear,
      setPrice: (price) => setFilters((current) => ({ ...current, price })),
      setAge: (age) => setFilters((current) => ({ ...current, age })),
      toggleGender: (gender) =>
        setFilters((current) => ({
          ...current,
          genders: current.genders.includes(gender)
            ? current.genders.filter((g) => g !== gender)
            : [...current.genders, gender],
        })),
      setFollowers: (followers) => setFilters((current) => ({ ...current, followers })),
      setAvailableOnly: (availableOnly) => setFilters((current) => ({ ...current, availableOnly })),
      removeChip: (chip) => {
        if (chip.key === "gender" && chip.value) {
          const gender = chip.value as Gender;
          setFilters((current) => ({
            ...current,
            genders: current.genders.filter((g) => g !== gender),
          }));
        } else if (chip.value && isMultiSelectFilter(chip.key)) {
          toggleValue(chip.key, chip.value);
        } else {
          clear([chip.key]);
        }
      },
    }),
    [toggleValue, clear],
  );

  return { filters, actions };
}
