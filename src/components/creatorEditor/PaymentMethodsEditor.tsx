"use client";

import { useActionState } from "react";
import type { PaymentMethod } from "@/lib/payments";
import { updatePaymentMethods, type SaveResult } from "@/lib/actions/creatorProfile";
import { PaymentMethodsPicker } from "@/components/payments/PaymentMethodsPicker";
import { PaymentNotice } from "@/components/payments/PaymentInfo";
import { SaveRow } from "./EditorSection";

/** The ways the creator accepts to be paid. Brands see this on the profile and on applications. */
export function PaymentMethodsEditor({ initial }: { initial: PaymentMethod[] }) {
  const [result, formAction, pending] = useActionState<SaveResult, FormData>(
    updatePaymentMethods,
    {},
  );
  return (
    <form action={formAction} className="space-y-4">
      <PaymentMethodsPicker
        legend="How can brands pay you?"
        hint="Pick every method you accept, so brands know before they hire you."
        initial={initial}
      />
      <PaymentNotice />
      <SaveRow pending={pending} result={result} />
    </form>
  );
}
