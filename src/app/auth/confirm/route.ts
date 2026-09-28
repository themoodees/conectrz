import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ensureCompanyProfile } from "@/lib/data/account";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Landing URL for the sign-up confirmation email.
 * Supports both the PKCE `code` flow and the `token_hash` email template flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { data: { user: null }, error: new Error("Missing confirmation token") };

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=confirmation", origin));
  }

  await ensureCompanyProfile(supabase, data.user);
  return NextResponse.redirect(new URL("/discover", origin));
}
