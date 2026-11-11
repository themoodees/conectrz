// Supabase Edge Function: keeps Resend's marketing contact list in step with consent given at sign-up.
//
// Called by the web app with the signed-in user's own token and { mode }:
//   "subscribe" → after the email is confirmed: if the person ticked "send me news and tips" at sign-up,
//                 adds them (once) to the Resend list for their account type + language.
//   "remove"    → when they delete their account: removes them from Resend and from our record.
//
// Nothing happens unless the optional secrets below are set, so it is safe to deploy first.
// Secrets: RESEND_CONTACTS_API_KEY (a Resend key that may manage contacts; the sending key can't),
//          RESEND_SEGMENTS = JSON like {"creator_en":"<id>","creator_ja":"<id>","company_en":"<id>","company_ja":"<id>"}
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

function segments(): Record<string, string> | null {
  try {
    const parsed = JSON.parse(Deno.env.get("RESEND_SEGMENTS") ?? "");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: caller } = await supabase.auth.getUser(token);
  const user = caller.user;
  if (!user?.email) return json({ error: "unauthorized" }, 401);

  let mode = "";
  try {
    ({ mode } = await req.json());
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  const apiKey = Deno.env.get("RESEND_CONTACTS_API_KEY");
  const lists = segments();
  if (!apiKey || !lists) return json({ skipped: "not_configured" });
  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };

  if (mode === "subscribe") {
    if (user.user_metadata?.marketing_opt_in !== true) return json({ skipped: "no_consent" });

    // Only ever once: if they later unsubscribe in Resend, signing in again must not re-add them.
    const { data: existing } = await supabase
      .from("marketing_consents")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) return json({ skipped: "already_recorded" });

    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", user.id)
      .maybeSingle();
    const role = user.user_metadata?.role === "creator" ? "creator" : "company";
    const lang = profile?.preferred_language === "ja" ? "ja" : "en";
    const list = `${role}_${lang}`;
    const segmentId = lists[list];
    if (!segmentId) return json({ skipped: "no_list" });

    const response = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers,
      body: JSON.stringify({ email: user.email, unsubscribed: false, segments: [{ id: segmentId }] }),
    });
    if (!response.ok) {
      console.error("marketing-contact: Resend error", response.status, await response.text());
      return json({ error: "resend_failed" }, 502);
    }
    await supabase.from("marketing_consents").insert({ user_id: user.id, list });
    return json({ ok: true, list });
  }

  if (mode === "remove") {
    const response = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(user.email)}`, {
      method: "DELETE",
      headers,
    });
    // 404 = they were never on the list, which is fine.
    if (!response.ok && response.status !== 404) {
      console.error("marketing-contact: Resend delete error", response.status, await response.text());
    }
    await supabase.from("marketing_consents").delete().eq("user_id", user.id);
    return json({ ok: true });
  }

  return json({ error: "invalid_mode" }, 400);
});
