import "server-only";
import { track } from "@vercel/analytics/server";
import { isMockMode } from "@/lib/config";

/*
 * Product events for Vercel Analytics (no personal data: never pass emails, names or ids).
 * Never throws: analytics must not break a sign-up or a payment.
 */
export type AnalyticsEvent =
  | { name: "signup_completed"; props: { role: "company" | "creator" } }
  | { name: "checkout_started"; props: { plan: string } }
  | { name: "conversation_started"; props?: undefined };

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  if (isMockMode) return;
  try {
    await track(event.name, event.props);
  } catch {
    // ignore
  }
}
