import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { env, isGoogleAuthConfigured } from "@/lib/env";
import { loginSchema } from "@/lib/validations/auth";

// Full, Node.js-only Auth.js instance — used by API routes and server components. Never
// imported from middleware.ts (see lib/auth.config.ts for why).
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  // Credentials-based sign-in is not compatible with adapter-backed ("database") sessions in
  // Auth.js — mixing Credentials with an Adapter requires "jwt" explicitly (set in
  // auth.config.ts). The Session model stays in the Prisma schema for adapter
  // compatibility/future-proofing, but with this strategy it is not written to at runtime;
  // session state lives in the signed JWT.
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        // Reject if no such user, or if the account has no password (Google-only account
        // attempting password login) — never compare against a null/undefined hash.
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    // Google sign-in is simply omitted from the provider list when credentials aren't
    // configured — the login page's Google button only renders when this is present, so
    // credentials-based auth is fully usable during development before Google OAuth is set up.
    ...(isGoogleAuthConfigured
      ? [
          Google({
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
});
