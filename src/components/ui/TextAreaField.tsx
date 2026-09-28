import type { TextareaHTMLAttributes } from "react";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  hint?: string;
}

/** Labelled multi-line text input used in forms. */
export function TextAreaField({
  label,
  name,
  hint,
  id,
  className = "",
  ...props
}: TextAreaFieldProps) {
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <textarea
        id={inputId}
        name={name}
        aria-describedby={hintId}
        rows={4}
        className="w-full rounded-control border border-border bg-white px-3.5 py-2.5 text-base text-ink transition-colors placeholder:text-muted hover:border-muted/50 focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none focus-visible:outline-none md:text-sm"
        {...props}
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
