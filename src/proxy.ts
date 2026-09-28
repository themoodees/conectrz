import { NextResponse, type NextRequest } from "next/server";
import { isMockMode } from "@/lib/config";
import { updateSession } from "@/lib/supabase/proxy";

/** Pages anyone can open without signing in. */
const PUBLIC_PATHS = ["/login", "/signup", "/auth"];

/**
 * Keeps the Supabase session fresh and sends signed-out visitors to /login.
 * This is an optimistic check only — pages still verify the user on the server.
 */
export async function proxy(request: NextRequest) {
  if (isMockMode) return NextResponse.next();

  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  return response;
}

export const config = {
  // Skip static files and image optimization.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
