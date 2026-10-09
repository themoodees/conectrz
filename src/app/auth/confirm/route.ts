import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ensureCompanyProfile } from "@/lib/data/account";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Landing URL for auth emails (sign-up confirmation, password reset).
 * Supports both the PKCE `code` flow and the `token_hash` email template flow.
 * `next` (an in-app path) says where to go afterwards, e.g. /reset-password.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "";
  const next = /^\/(?![/\\])/.test(nextParam) ? nextParam : "/home";

  const supabase = await createSupabaseServerClient();
  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { data: { user: null }, error: new Error("Missing confirmation token") };

  if (error || !data.user) {
    const reason = next === "/reset-password" ? "reset" : "confirmation";
    return NextResponse.redirect(new URL(`/login?error=${reason}`, origin));
  }

  await ensureCompanyProfile(supabase, data.user);
  return NextResponse.redirect(new URL(next, origin));
}
