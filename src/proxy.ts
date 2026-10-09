import { NextResponse, type NextRequest } from "next/server";
import { isMockMode } from "@/lib/config";
import { updateSession } from "@/lib/supabase/proxy";

/** Pages anyone can open without signing in (prefixes; "/" is matched exactly). */
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/auth",
  "/terms",
  "/privacy",
  "/legal",
];
const isPublicPath = (pathname: string) =>
  pathname === "/" || PUBLIC_PATHS.some((path) => pathname.startsWith(path));

/**
 * Keeps the Supabase session fresh and sends signed-out visitors to /login.
 * This is an optimistic check only — pages still verify the user on the server.
 */
export async function proxy(request: NextRequest) {
  if (isMockMode) return NextResponse.next();

  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;
  const isPublic = isPublicPath(pathname);

  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Signed-in users skip the sign-in/sign-up pages. /home picks their area by role.
  if (user && (pathname === "/login" || pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  // Skip static files and image optimization.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
