"use client";

import { useEffect } from "react";
import { sendGTMEvent } from "@next/third-parties/google";

const COOKIE = "cz_signup";

/** Reads the one-time cookie set when a sign-up email is confirmed, then sends `sign_up` to GTM. */
export function SignupEvent() {
  useEffect(() => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
    if (!match) return;
    document.cookie = `${COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
    sendGTMEvent({ event: "sign_up", role: decodeURIComponent(match[1]) });
  }, []);
  return null;
}
