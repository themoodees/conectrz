"use client";

import { useTranslations } from "next-intl";
import type { NumberRange } from "@/types/discovery";

interface RangeSliderProps {
  label: string;
  min: number;
  /** Top stop: choosing it means "and above". */
  max: number;
  step: number;
  /** `null` = the whole range (no filter). */
  value: NumberRange | null;
  onChange: (value: NumberRange | null) => void;
  format: (n: number) => string;
}

/** Two-handle slider. Dragging the right handle to the end means "max+" (no upper limit). */
export function RangeSlider({ label, min, max, step, value, onChange, format }: RangeSliderProps) {
  const t = useTranslations("app.filters");
  const low = value?.min ?? min;
  const high = value ? (value.max ?? max) : max;
  const pct = (n: number) => ((n - min) / (max - min)) * 100;

  function commit(nextLow: number, nextHigh: number) {
    // Full range = filter off. Right handle at the end = no upper limit.
    if (nextLow <= min && nextHigh >= max) onChange(null);
    else onChange({ min: nextLow, max: nextHigh >= max ? null : nextHigh });
  }

  const show = (n: number) => (n >= max ? `${format(max)}+` : format(n));

  return (
    <div className="w-full min-w-64">
      <p className="mb-4 text-sm font-medium text-ink" aria-live="polite">
        {show(low)} – {show(high)}
      </p>
      <div className="range-slider relative h-6">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-border" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%` }}
        />
        <input
          type="range"
          aria-label={t("rangeMin", { label })}
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(e) => commit(Math.min(Number(e.target.value), high - step), high)}
        />
        <input
          type="range"
          aria-label={t("rangeMax", { label })}
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(e) => commit(low, Math.max(Number(e.target.value), low + step))}
        />
      </div>
    </div>
  );
}
