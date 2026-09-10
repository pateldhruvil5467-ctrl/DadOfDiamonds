import "dotenv/config";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Seed-only environment schema — deliberately separate from lib/env.ts (the runtime schema).
 * SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD are required for THIS script only; the running app
 * never reads them and starts/works fine without them ever being set.
 */
const seedEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required to seed the database"),
  SEED_ADMIN_EMAIL: z
    .string()
    .trim()
    .toLowerCase()
    .email("SEED_ADMIN_EMAIL must be a valid email address"),
  SEED_ADMIN_PASSWORD: z
    .string()
    .min(8, "SEED_ADMIN_PASSWORD must be at least 8 characters"),
});

function loadSeedEnv() {
  const parsed = seedEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Cannot seed the database — missing/invalid seed configuration:\n${issues}\n\n` +
        "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env before running " +
        "`npx prisma db seed`. These are used only by this script, never by the running app.",
    );
  }
  return parsed.data;
}

const seedEnv = loadSeedEnv();

const adapter = new PrismaPg({ connectionString: seedEnv.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: "Rings", slug: "rings" },
  { name: "Earrings", slug: "earrings" },
  { name: "Chains & Necklaces", slug: "chains-necklaces" },
  { name: "Bracelets", slug: "bracelets" },
];

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(seedEnv.SEED_ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: seedEnv.SEED_ADMIN_EMAIL },
    update: {
      role: "ADMIN",
      passwordHash,
    },
    create: {
      email: seedEnv.SEED_ADMIN_EMAIL,
      name: "Dad of Diamonds Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log(`Admin user ready: ${admin.email}`);
}

async function seedCategories() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);
}

async function main() {
  await seedAdmin();
  await seedCategories();
  // Product catalog seeding (placeholder jewelry + SVG art) is added in the storefront
  // phase, once the placeholder image assets exist.
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
