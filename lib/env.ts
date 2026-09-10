import { z } from "zod";

// Treats an empty-string env value (e.g. `GOOGLE_CLIENT_ID=` with nothing after the `=`,
// which .env files commonly use as a placeholder) the same as "unset" for optional fields.
const optionalNonEmpty = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

/**
 * Runtime environment schema for the running app ONLY.
 *
 * Deliberately does NOT include SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD — those are read and
 * validated separately by prisma/seed.ts, because the app must be able to start and run with
 * no bearing on whether those seed-only variables exist. See prisma/seed.ts for that schema.
 */
const envSchema = z
  .object({
    // Pooled Neon connection — used by the application runtime (see lib/prisma.ts).
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    // Direct/unpooled Neon connection — used exclusively by the Prisma CLI for
    // migrations/seed (see prisma7.config.ts). No application code reads this value; it is
    // validated here too so a missing/malformed DIRECT_URL is caught early and consistently
    // rather than only surfacing when a migration command happens to run.
    DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),
    NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
    NEXTAUTH_URL: z.string().min(1, "NEXTAUTH_URL is required"),
    // Optional pair: Google sign-in is simply omitted from the auth config when unset, so
    // credentials-based auth can be developed before Google OAuth credentials exist.
    GOOGLE_CLIENT_ID: optionalNonEmpty,
    GOOGLE_CLIENT_SECRET: optionalNonEmpty,
    PAYMENT_PROVIDER: z.enum(["mock", "stripe", "razorpay"]).optional().default("mock"),
  })
  .refine(
    (data) => Boolean(data.GOOGLE_CLIENT_ID) === Boolean(data.GOOGLE_CLIENT_SECRET),
    {
      message:
        "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must both be set, or both left unset",
      path: ["GOOGLE_CLIENT_ID"],
    },
  );

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid runtime environment configuration:\n${issues}\n\nCheck your .env against .env.example.`,
    );
  }
  return parsed.data;
}

export const env = loadEnv();

export const isGoogleAuthConfigured = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);
