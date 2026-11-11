import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ensureCompanyProfile } from "@/lib/data/account";
import { syncLocaleOnSignIn } from "@/lib/data/language";
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
  await syncLocaleOnSignIn(supabase, data.user.id);
  // Ticked "news and tips" at sign-up: add them to the marketing list now that the email is confirmed.
  if (data.user.user_metadata?.marketing_opt_in === true && next !== "/reset-password") {
    try {
      await supabase.functions.invoke("marketing-contact", { body: { mode: "subscribe" } });
    } catch {
      // never block sign-in on the mailing list
    }
  }
  const response = NextResponse.redirect(new URL(next, origin));
  // One-time marker so the next page can send a `sign_up` conversion to GTM (not for password resets).
  if (next !== "/reset-password") {
    const role = data.user.user_metadata?.role === "creator" ? "creator" : "company";
    response.cookies.set("cz_signup", role, { path: "/", maxAge: 600, sameSite: "lax" });
  }
  return response;
}
