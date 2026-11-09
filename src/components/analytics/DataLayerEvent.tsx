"use client";

import { useEffect } from "react";
import { sendGTMEvent } from "@next/third-parties/google";

/**
 * Pushes one event to Google Tag Manager's dataLayer when shown (production only, since GTM
 * only loads there). `dedupeKey` stops a page refresh from counting the same conversion twice.
 * Never put emails, names or ids in `data`.
 */
export function DataLayerEvent({
  event,
  data,
  dedupeKey,
}: {
  event: string;
  data?: Record<string, string | number>;
  dedupeKey: string;
}) {
  const payload = JSON.stringify(data ?? {});
  useEffect(() => {
    const storageKey = `gtm_sent_${event}_${dedupeKey}`;
    try {
      if (localStorage.getItem(storageKey)) return;
      localStorage.setItem(storageKey, "1");
    } catch {
      // storage blocked: send anyway
    }
    sendGTMEvent({ event, event_id: `${event}_${dedupeKey}`, ...JSON.parse(payload) });
  }, [event, payload, dedupeKey]);
  return null;
}
