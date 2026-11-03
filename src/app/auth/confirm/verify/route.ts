import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ensureCompanyProfile } from "@/lib/data/account";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Spends the one-time token from an auth email (sign-up confirmation, password reset).
 * It is a POST on purpose: mail scanners (Outlook, Hotmail) open links with GET and would
 * otherwise use the token up before the person clicks. The /auth/confirm page shows a
 * button that posts here. Supports the PKCE `code` flow and the `token_hash` flow.
 */
export async function POST(request: NextRequest) {
  const { origin } = request.nextUrl;
  const form = await request.formData();
  const field = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" && v ? v : null;
  };
  const code = field("code");
  const tokenHash = field("token_hash");
  const type = field("type") as EmailOtpType | null;
  const nextParam = field("next") ?? "";
  const next = /^\/(?![/\\])/.test(nextParam) ? nextParam : "/home";

  const supabase = await createSupabaseServerClient();
  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { data: { user: null }, error: new Error("Missing confirmation token") };

  if (error || !data.user) {
    const reason = next === "/reset-password" ? "reset" : "confirmation";
    return NextResponse.redirect(new URL(`/login?error=${reason}`, origin), 303);
  }

  await ensureCompanyProfile(supabase, data.user);
  return NextResponse.redirect(new URL(next, origin), 303);
}
