"use client";

import { useState } from "react";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payments";
import { OptionButton } from "@/components/discovery/OptionButton";

/** Chip picker for payment methods. Submits its choices as repeated `paymentMethods` inputs. */
export function PaymentMethodsPicker({
  legend,
  hint,
  initial = [],
}: {
  legend: string;
  hint?: string;
  initial?: PaymentMethod[];
}) {
  const [selected, setSelected] = useState<PaymentMethod[]>(initial);
  const toggle = (id: PaymentMethod) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-ink">{legend}</legend>
      {hint && <p className="mb-2 text-xs text-muted">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {PAYMENT_METHODS.map((method) => (
          <OptionButton
            key={method.id}
            label={method.label}
            isSelected={selected.includes(method.id)}
            onClick={() => toggle(method.id)}
          />
        ))}
      </div>
      {selected.map((id) => (
        <input key={id} type="hidden" name="paymentMethods" value={id} />
      ))}
    </fieldset>
  );
}
