import { PAYMENT_LABELS, PAYMENT_NOTICE, type PaymentMethod } from "@/lib/payments";

/** The methods as small tags; methods in `highlight` get a check mark. */
export function PaymentMethodTags({
  methods,
  highlight = [],
}: {
  methods: readonly PaymentMethod[];
  highlight?: readonly PaymentMethod[];
}) {
  if (methods.length === 0) return <span className="text-sm text-muted">Not specified</span>;
  return (
    <ul className="flex flex-wrap gap-2">
      {methods.map((method) => (
        <li
          key={method}
          className={`rounded-md px-2.5 py-1 text-sm font-medium ${
            highlight.includes(method) ? "bg-primary-light text-primary" : "bg-surface text-graphite"
          }`}
        >
          {highlight.includes(method) && <span aria-hidden="true">✓ </span>}
          {PAYMENT_LABELS[method]}
        </li>
      ))}
    </ul>
  );
}

export function PaymentNotice({ className = "" }: { className?: string }) {
  return <p className={`text-xs text-muted ${className}`}>{PAYMENT_NOTICE}</p>;
}
