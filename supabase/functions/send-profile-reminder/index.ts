// Supabase Edge Function: emails creators who signed up but are not visible to companies. Admins only.
//
// Called by the admin page (/admin/reminders) with the signed-in admin's token and { mode }:
//   "count" → how many creators would get the reminder (nothing is sent)
//   "test"  → sends the 4 versions (2 situations × English/Japanese) to the admin's own email only
//   "send"  → sends one reminder to each eligible creator, once ever (needs { expected } = the count shown)
//
// Two situations:
//   hidden_profile  profile exists (active) but is missing prefecture, language or service
//   no_profile      email confirmed, creator profile never created
// Email language = profiles.preferred_language (English when none).
//
// Secrets: RESEND_API_KEY, EMAIL_FROM, APP_URL (shared with notify-new-message); SUPPORT_EMAIL optional.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type Lang = "en" | "ja";
type Kind = "hidden_profile" | "no_profile";
type Missing = "location" | "language" | "service";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const MISSING_TEXT: Record<Lang, Record<Missing, string>> = {
  en: {
    location: "Your prefecture",
    language: "At least one language",
    service: "At least one service (for example, UGC video) with your rate",
  },
  ja: {
    location: "お住まいの都道府県",
    language: "言語（1つ以上）",
    service: "サービス（例：UGC動画）と料金（1つ以上）",
  },
};

interface Content {
  subject: string;
  greeting: string;
  paragraphs: string[];
  listIntro?: string;
  items?: string[];
  closing?: string;
  button: string;
  help: string;
  signoff: string;
}

function build(lang: Lang, kind: Kind, firstName: string, missing: Missing[], support: string): Content {
  if (lang === "ja") {
    return kind === "hidden_profile"
      ? {
          subject: "ブランドに見つけてもらうために、Conectrzのプロフィールを完成させましょう",
          greeting: `${firstName}さん`,
          paragraphs: [
            "Conectrzにご登録いただきありがとうございます。現在、プロフィールがブランドにはまだ表示されておらず、検索で見つけてもらえない状態です。",
          ],
          listIntro: "検索に表示されるには、次の項目を追加してください：",
          items: missing.map((m) => MISSING_TEXT.ja[m]),
          closing: "数分で完了します。",
          button: "プロフィールを完成させる",
          help: `ご不明な点は ${support} までご連絡ください。`,
          signoff: "Conectrzチーム",
        }
      : {
          subject: "ブランドに見つけてもらうために、Conectrzのプロフィールを作成しましょう",
          greeting: "こんにちは。",
          paragraphs: [
            "Conectrzでメールアドレスをご確認いただきありがとうございます。まだクリエイタープロフィールが作成されていないため、ブランドから見つけてもらえない状態です。",
            "プロフィールには、都道府県、言語（1つ以上）、サービス（例：UGC動画）と料金（1つ以上）が必要です。数分で完了します。",
          ],
          button: "プロフィールを作成する",
          help: `ご不明な点は ${support} までご連絡ください。`,
          signoff: "Conectrzチーム",
        };
  }
  return kind === "hidden_profile"
    ? {
        subject: "Finish your Conectrz profile so brands can find you",
        greeting: `Hi ${firstName},`,
        paragraphs: [
          "Thanks for joining Conectrz. Your profile isn't visible to brands yet, so they can't find you in search.",
        ],
        listIntro: "To appear in search, please add:",
        items: missing.map((m) => MISSING_TEXT.en[m]),
        closing: "It only takes a few minutes.",
        button: "Complete my profile",
        help: `Questions? Contact us at ${support}.`,
        signoff: "The Conectrz team",
      }
    : {
        subject: "Create your Conectrz profile so brands can find you",
        greeting: "Hi,",
        paragraphs: [
          "Thanks for confirming your email on Conectrz. You haven't created your creator profile yet, so brands can't find you.",
          "Your profile needs your prefecture, at least one language and at least one service (for example, UGC video) with your rate. It only takes a few minutes.",
        ],
        button: "Create my profile",
        help: `Questions? Contact us at ${support}.`,
        signoff: "The Conectrz team",
      };
}

function render(lang: Lang, c: Content, link: string) {
  const text = [
    c.greeting,
    "",
    ...c.paragraphs.flatMap((p) => [p, ""]),
    ...(c.listIntro ? [c.listIntro, ...(c.items ?? []).map((i) => `• ${i}`), ""] : []),
    ...(c.closing ? [c.closing, ""] : []),
    `${c.button}: ${link}`,
    "",
    c.help,
    c.signoff,
  ].join("\n");
  const p = (t: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3f4145">${escapeHtml(t)}</p>`;
  const html = `<!doctype html>
<html lang="${lang}"><body style="margin:0;background:#f7f7f8;font-family:Inter,Arial,sans-serif;color:#111315">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <p style="font-size:20px;font-weight:700;margin:0 0 24px">conectrz</p>
    <div style="background:#ffffff;border:1px solid #e6e7e9;border-radius:14px;padding:24px">
      <p style="margin:0 0 14px;font-size:16px">${escapeHtml(c.greeting)}</p>
      ${c.paragraphs.map(p).join("\n      ")}
      ${
        c.listIntro
          ? `${p(c.listIntro)}<ul style="margin:0 0 14px;padding-left:20px;font-size:15px;line-height:1.7;color:#3f4145">${(c.items ?? [])
              .map((i) => `<li>${escapeHtml(i)}</li>`)
              .join("")}</ul>`
          : ""
      }
      ${c.closing ? p(c.closing) : ""}
      <a href="${escapeHtml(link)}" style="display:inline-block;background:#7257f5;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 18px;border-radius:10px">${escapeHtml(c.button)}</a>
    </div>
    <p style="margin:20px 0 0;font-size:12px;line-height:1.5;color:#74777d">${escapeHtml(c.help)}<br>${escapeHtml(c.signoff)}</p>
  </div>
</body></html>`;
  return { text, html };
}

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

interface Recipient {
  id: string;
  email: string;
  kind: Kind;
  firstName: string;
  missing: Missing[];
  lang: Lang;
}

/** Creators who confirmed their email, are not visible to companies and have not had the reminder yet. */
async function findRecipients(): Promise<Recipient[]> {
  const { data, error } = await supabase.rpc("profile_reminder_candidates");
  if (error) {
    console.error("send-profile-reminder: candidates query failed:", error.message);
    throw new Error("candidates_failed");
  }

  const out: Recipient[] = [];
  // deno-lint-ignore no-explicit-any
  for (const r of (data ?? []) as any[]) {
    const lang: Lang = r.preferred_language === "ja" ? "ja" : "en";
    if (!r.has_profile) {
      out.push({ id: r.user_id, email: r.email, kind: "no_profile", firstName: "", missing: [], lang });
      continue;
    }
    if (r.status !== "active") continue;
    const missing: Missing[] = [];
    if (!r.has_prefecture) missing.push("location");
    if (!r.has_language) missing.push("language");
    if (!r.has_service) missing.push("service");
    if (missing.length) {
      out.push({ id: r.user_id, email: r.email, kind: "hidden_profile", firstName: r.first_name || "", missing, lang });
    }
  }
  return out;
}

async function sendEmail(to: string, subject: string, html: string, text: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    // Replies go to the support inbox, not to the notifications sender.
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM"),
      to: [to],
      reply_to: Deno.env.get("SUPPORT_EMAIL") || "hello@conectrz.com",
      subject,
      html,
      text,
    }),
  });
  if (!response.ok) console.error("send-profile-reminder: Resend error", response.status, await response.text());
  return response.ok;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "admins_only" }, 401);
  const { data: caller } = await supabase.auth.getUser(token);
  if (!caller.user) return json({ error: "admins_only" }, 401);
  const { data: callerProfile } = await supabase.from("profiles").select("role").eq("id", caller.user.id).maybeSingle();
  if (callerProfile?.role !== "admin") return json({ error: "admins_only" }, 403);

  let body: { mode?: string; expected?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  if (!Deno.env.get("RESEND_API_KEY") || !Deno.env.get("EMAIL_FROM") || !Deno.env.get("APP_URL")) {
    return json({ error: "not_configured" }, 500);
  }
  const appUrl = Deno.env.get("APP_URL")!;
  const support = Deno.env.get("SUPPORT_EMAIL") || "hello@conectrz.com";
  const linkFor = (kind: Kind) => `${appUrl}${kind === "hidden_profile" ? "/creator/profile" : "/creator/onboarding"}`;

  if (body.mode === "count" || body.mode === "send") {
    let recipients: Recipient[];
    try {
      recipients = await findRecipients();
    } catch {
      return json({ error: "candidates_failed" }, 500);
    }
    const counts = {
      hidden_profile: recipients.filter((r) => r.kind === "hidden_profile").length,
      no_profile: recipients.filter((r) => r.kind === "no_profile").length,
    };
    if (body.mode === "count") return json({ total: recipients.length, ...counts });

    // Safety: only send to exactly the number the admin saw on screen.
    if (body.expected !== recipients.length) return json({ error: "count_changed", total: recipients.length }, 409);

    let sent = 0;
    let failed = 0;
    for (const r of recipients) {
      // Claim first so a retry or double click can never email the same person twice.
      const { error: claimError } = await supabase.from("profile_reminders").insert({ user_id: r.id, kind: r.kind });
      if (claimError) continue;
      const c = build(r.lang, r.kind, r.firstName, r.missing, support);
      const { html, text } = render(r.lang, c, linkFor(r.kind));
      if (await sendEmail(r.email, c.subject, html, text)) {
        sent++;
      } else {
        failed++;
        await supabase.from("profile_reminders").delete().eq("user_id", r.id);
      }
      await new Promise((resolve) => setTimeout(resolve, 600)); // stay under Resend's rate limit
    }
    return json({ sent, failed });
  }

  if (body.mode === "test") {
    const to = caller.user.email;
    if (!to) return json({ error: "no_email" }, 400);
    const samples: [Lang, Kind, Missing[]][] = [
      ["en", "hidden_profile", ["language", "service"]],
      ["ja", "hidden_profile", ["language", "service"]],
      ["en", "no_profile", []],
      ["ja", "no_profile", []],
    ];
    let sent = 0;
    for (const [lang, kind, missing] of samples) {
      const c = build(lang, kind, "Marilia", missing, support);
      const { html, text } = render(lang, c, linkFor(kind));
      if (await sendEmail(to, `[TEST] ${c.subject}`, html, text)) sent++;
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    return json({ sent });
  }

  return json({ error: "invalid_mode" }, 400);
});
