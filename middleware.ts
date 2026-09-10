import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Edge-safe instance (no Prisma adapter, no Credentials provider) — only reads the JWT
// session cookie. This is a UX-level redirect only; it is NOT the security boundary for
// admin actions. Every admin API route/server action independently calls requireAdmin()
// (lib/auth-guards.ts), which re-checks the role against the database — see that file for
// why the JWT's role claim alone is never trusted for the actual authorization decision.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  if (!isAdminRoute) return NextResponse.next();

  const role = req.auth?.user?.role;
  if (role !== "ADMIN") {
    const signInUrl = new URL("/login", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
