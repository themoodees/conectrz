import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "./icons";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  /** Adds an empty first option with this text. */
  placeholder?: string;
}

/** Labelled native select used in forms. */
export function SelectField({
  label,
  name,
  options,
  placeholder,
  id,
  className = "",
  ...props
}: SelectFieldProps) {
  const selectId = id ?? name;
  return (
    <div className={className}>
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <span className="relative block">
        <select
          id={selectId}
          name={name}
          className="h-11 w-full appearance-none rounded-control border border-border bg-white pr-10 pl-3.5 text-base text-ink transition-colors hover:border-muted/50 focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none focus-visible:outline-none md:text-sm"
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
      </span>
    </div>
  );
}
