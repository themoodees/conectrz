import "server-only";
import Stripe from "stripe";

/*
 * Stripe client for checkout and the billing portal.
 * STRIPE_SECRET_KEY lives ONLY in the server environment (Vercel / .env.local).
 * Without it, billing is "not configured" and the app falls back to
 * "request a plan by email".
 */

export const isBillingConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | undefined;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  return (client ??= new Stripe(process.env.STRIPE_SECRET_KEY));
}
