/*
 * Payment methods. Conectrz does not process payments: the company and the creator settle
 * it directly. Both sides state their methods up front so there are no surprises at the end.
 * Values match the `payment_methods` check constraints in the database.
 */

export type PaymentMethod = "bank_transfer" | "paypal" | "wise" | "stripe" | "other";

export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "bank_transfer", label: "Bank transfer" },
  { id: "paypal", label: "PayPal" },
  { id: "wise", label: "Wise" },
  { id: "stripe", label: "Stripe" },
  { id: "other", label: "Other" },
];

export const PAYMENT_LABELS = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.id, m.label]),
) as Record<PaymentMethod, string>;

/** Shown wherever payment methods appear. Have a lawyer review the wording before launch. */
export const PAYMENT_NOTICE =
  "Payment is arranged directly between the company and the creator. Conectrz does not process, hold or guarantee payments.";

/** Keeps only valid, unique method ids (input comes from forms and the database). */
export function parsePaymentMethods(values: readonly string[] | null | undefined): PaymentMethod[] {
  const valid = new Set<string>(PAYMENT_METHODS.map((m) => m.id));
  return [...new Set(values ?? [])].filter((v): v is PaymentMethod => valid.has(v));
}

/** Methods both sides listed. */
export const sharedPaymentMethods = (a: readonly PaymentMethod[], b: readonly PaymentMethod[]) =>
  a.filter((method) => b.includes(method));
