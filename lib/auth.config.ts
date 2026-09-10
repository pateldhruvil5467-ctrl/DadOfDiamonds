import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Edge-safe base config shared between the full Node.js auth instance (lib/auth.ts, used by
 * API routes/server components — has the Prisma adapter + Credentials provider) and the
 * lightweight instance middleware.ts uses to read the JWT session.
 *
 * This file must never import lib/prisma.ts or anything that pulls in the `pg` driver —
 * middleware.ts runs on the Edge runtime, which cannot bundle Node-only DB drivers. It only
 * needs to verify/read an existing JWT session cookie, never touch the database.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
