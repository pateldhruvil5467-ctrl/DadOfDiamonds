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

/**
 * Demo catalog for the Phase 2.1 storefront. Prices/descriptions are placeholder content for
 * development/demo purposes — the client supplies real product data before launch. Each
 * product reuses one of the four hand-drawn category SVGs (public/categories/*.svg) as its
 * image; that's an honest placeholder, not fake production content.
 */
const PRODUCTS = [
  {
    slug: "classic-solitaire-ring",
    name: "Classic Solitaire Ring",
    description: "A single round-cut diamond set in polished 18k white gold. Timeless and understated.",
    price: 1250,
    categorySlug: "rings",
    material: "18k White Gold",
    sku: "DOD-RING-001",
    stock: 8,
    isFeatured: true,
    image: "/categories/ring.svg",
  },
  {
    slug: "eternity-band-ring",
    name: "Eternity Band Ring",
    description: "A continuous line of pavé diamonds set in 18k yellow gold, worn alone or stacked.",
    price: 980,
    categorySlug: "rings",
    material: "18k Yellow Gold",
    sku: "DOD-RING-002",
    stock: 10,
    isFeatured: false,
    image: "/categories/ring.svg",
  },
  {
    slug: "diamond-stud-earrings",
    name: "Diamond Stud Earrings",
    description: "Brilliant-cut diamond studs in 14k white gold — an everyday essential.",
    price: 650,
    categorySlug: "earrings",
    material: "14k White Gold",
    sku: "DOD-EAR-001",
    stock: 12,
    isFeatured: true,
    image: "/categories/earring.svg",
  },
  {
    slug: "drop-diamond-earrings",
    name: "Drop Diamond Earrings",
    description: "A single diamond suspended from a delicate 18k rose gold setting.",
    price: 890,
    categorySlug: "earrings",
    material: "18k Rose Gold",
    sku: "DOD-EAR-002",
    stock: 9,
    isFeatured: false,
    image: "/categories/earring.svg",
  },
  {
    slug: "diamond-pendant-necklace",
    name: "Diamond Pendant Necklace",
    description: "A solitaire diamond pendant on a fine 18k white gold chain.",
    price: 1100,
    categorySlug: "chains-necklaces",
    material: "18k White Gold",
    sku: "DOD-NECK-001",
    stock: 7,
    isFeatured: true,
    image: "/categories/necklace.svg",
  },
  {
    slug: "tennis-chain-necklace",
    name: "Tennis Chain Necklace",
    description: "A continuous line of diamonds in 18k yellow gold — bold, everyday luxury.",
    price: 2100,
    categorySlug: "chains-necklaces",
    material: "18k Yellow Gold",
    sku: "DOD-NECK-002",
    stock: 5,
    isFeatured: false,
    image: "/categories/necklace.svg",
  },
  {
    slug: "diamond-tennis-bracelet",
    name: "Diamond Tennis Bracelet",
    description: "A classic line of matched diamonds set in 18k white gold.",
    price: 1750,
    categorySlug: "bracelets",
    material: "18k White Gold",
    sku: "DOD-BRC-001",
    stock: 6,
    isFeatured: true,
    image: "/categories/bracelet.svg",
  },
  {
    slug: "classic-bangle-bracelet",
    name: "Classic Bangle Bracelet",
    description: "A solid 18k yellow gold bangle with a row of pavé diamond accents.",
    price: 940,
    categorySlug: "bracelets",
    material: "18k Yellow Gold",
    sku: "DOD-BRC-002",
    stock: 10,
    isFeatured: false,
    image: "/categories/bracelet.svg",
  },
] as const;

async function seedProducts() {
  const categories = await prisma.category.findMany();
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  for (const item of PRODUCTS) {
    const categoryId = categoryIdBySlug.get(item.categorySlug);
    if (!categoryId) {
      throw new Error(`Cannot seed product "${item.slug}" — category "${item.categorySlug}" not found.`);
    }

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId,
        material: item.material,
        sku: item.sku,
        stock: item.stock,
        isFeatured: item.isFeatured,
        isUnisex: true,
      },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId,
        material: item.material,
        sku: item.sku,
        stock: item.stock,
        isFeatured: item.isFeatured,
        isUnisex: true,
      },
    });

    // Re-create this product's own image(s) so the seed stays idempotent/re-runnable —
    // this only ever touches ProductImage rows owned by this specific seeded product.
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: { productId: product.id, url: item.image, altText: item.name, position: 0 },
    });
  }

  console.log(`Seeded ${PRODUCTS.length} demo products.`);
}

async function main() {
  await seedAdmin();
  await seedCategories();
  await seedProducts();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
