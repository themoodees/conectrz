"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics";

/** Sends one product event when the page is shown (e.g. after a successful checkout). */
export function TrackOnMount({ event }: { event: string }) {
  useEffect(() => {
    track(event);
  }, [event]);
  return null;
}
