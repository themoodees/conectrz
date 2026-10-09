// Supabase Edge Function: emails a "new message" notification via Resend.
//
// Called by the notify_new_message database trigger with { notification_id }.
// It only sends for real, recent, un-emailed, unread notifications, so calling it
// again (or with a made-up id) never sends extra email.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY  — Resend API key
//   EMAIL_FROM      — e.g. "Conectrz <notifications@yourdomain.com>" (domain verified in Resend)
//   APP_URL         — e.g. "https://yourdomain.com" (no trailing slash)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const MAX_AGE_MS = 60 * 60 * 1000; // ignore notifications older than 1 hour
const PREVIEW_LENGTH = 200;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const escapeHtml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let notificationId: string | undefined;
  try {
    ({ notification_id: notificationId } = await req.json());
  } catch {
    return json({ error: "Invalid body" }, 400);
  }
  if (typeof notificationId !== "string" || !/^[0-9a-f-]{36}$/i.test(notificationId)) {
    return json({ error: "Invalid notification id" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: notification } = await supabase
    .from("notifications")
    .select("id, user_id, type, payload, read_at, created_at")
    .eq("id", notificationId)
    .maybeSingle();

  if (
    !notification ||
    notification.type !== "new_message" ||
    notification.read_at ||
    notification.payload?.emailed_at ||
    Date.now() - new Date(notification.created_at).getTime() > MAX_AGE_MS
  ) {
    return json({ skipped: true });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM");
  const appUrl = Deno.env.get("APP_URL");
  if (!resendKey || !from || !appUrl) {
    console.warn("notify-new-message: RESEND_API_KEY, EMAIL_FROM or APP_URL not set; skipping");
    return json({ skipped: true, reason: "not configured" });
  }

  const conversationId = notification.payload.conversation_id as string;
  const [{ data: conversation }, { data: message }, { data: recipientUser }] = await Promise.all([
    supabase
      .from("conversations")
      .select("creator_id, company_id, creator_profiles(display_name), company_profiles(name)")
      .eq("id", conversationId)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("content")
      .eq("id", notification.payload.message_id)
      .maybeSingle(),
    supabase.auth.admin.getUserById(notification.user_id),
  ]);

  const email = recipientUser?.user?.email;
  if (!conversation || !email) return json({ skipped: true, reason: "missing data" });

  // deno-lint-ignore no-explicit-any
  const c = conversation as any;
  const recipientIsCreator = notification.user_id === c.creator_id;
  const senderName = recipientIsCreator
    ? (c.company_profiles?.name ?? "A brand")
    : (c.creator_profiles?.display_name ?? "A creator");
  const link = `${appUrl}${recipientIsCreator ? "/creator/messages" : "/messages"}/${conversationId}`;

  const content = (message?.content ?? "").trim();
  const preview =
    content.length > PREVIEW_LENGTH ? `${content.slice(0, PREVIEW_LENGTH).trimEnd()}…` : content;

  const subject = `New message from ${senderName} on Conectrz`;
  const text = [
    `${senderName} sent you a message on Conectrz:`,
    "",
    preview,
    "",
    `Reply: ${link}`,
    "",
    "You're receiving this because you have a Conectrz account. We send one email per conversation until you read it.",
  ].join("\n");
  const html = `<!doctype html>
<html><body style="margin:0;background:#f7f7f8;font-family:Inter,Arial,sans-serif;color:#111315">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <p style="font-size:20px;font-weight:700;margin:0 0 24px">conectrz</p>
    <div style="background:#ffffff;border:1px solid #e6e7e9;border-radius:14px;padding:24px">
      <p style="margin:0 0 12px;font-size:16px"><strong>${escapeHtml(senderName)}</strong> sent you a message</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3f4145;white-space:pre-line">${escapeHtml(preview)}</p>
      <a href="${escapeHtml(link)}" style="display:inline-block;background:#7257f5;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 18px;border-radius:10px">Open conversation</a>
    </div>
    <p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:#74777d">
      You're receiving this because you have a Conectrz account. We send one email per conversation until you read it.
    </p>
  </div>
</body></html>`;

  // Claim the notification atomically so concurrent calls can't both send.
  const claimedAt = new Date().toISOString();
  const { data: claimed } = await supabase
    .from("notifications")
    .update({ payload: { ...notification.payload, emailed_at: claimedAt } })
    .eq("id", notification.id)
    .is("payload->>emailed_at", null)
    .select("id");
  if (!claimed?.length) return json({ skipped: true, reason: "already sent" });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email], subject, html, text }),
  });

  if (!response.ok) {
    console.error("notify-new-message: Resend error", response.status, await response.text());
    // Release the claim so a later call can retry.
    await supabase
      .from("notifications")
      .update({ payload: notification.payload })
      .eq("id", notification.id);
    return json({ error: "Email failed" }, 502);
  }

  return json({ sent: true });
});
