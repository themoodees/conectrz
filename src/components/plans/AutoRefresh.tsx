"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * After a plan change, Stripe tells us through a webhook a few seconds later.
 * This re-reads the page every couple of seconds for a short while so the new
 * plan shows up without the person having to refresh.
 */
export function AutoRefresh({ times = 8, everyMs = 2500 }: { times?: number; everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    let count = 0;
    const timer = setInterval(() => {
      router.refresh();
      if (++count >= times) clearInterval(timer);
    }, everyMs);
    return () => clearInterval(timer);
  }, [router, times, everyMs]);
  return null;
}
