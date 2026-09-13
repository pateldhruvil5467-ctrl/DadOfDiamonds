import { prisma } from "@/lib/prisma";
import { CollectionSelector } from "@/components/collection-selector";
import { ProductSpotlight } from "@/components/product-spotlight";
import { FeaturedCollection } from "@/components/featured-collection";
import { LuxuryButton } from "@/components/luxury-button";
import { FloatingDiamonds } from "@/components/floating-diamonds";
import { DiamondSparkle } from "@/components/diamond-sparkle";
import { Reveal } from "@/components/reveal";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const [spotlightProduct, ...remainingFeatured] = featuredProducts;

  return (
    <>
      {/* ============ 01 — OPENING HERO ============ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <p className="text-[10px] tracking-[0.5em] text-muted">DAD OF DIAMONDS</p>
            <p className="mt-6 eyebrow flex items-center justify-center gap-2">
              <DiamondSparkle size={11} />
              From Surat to the World
            </p>
          </Reveal>

          <Reveal delayMs={150}>
            <h1 className="mt-8 font-display text-5xl sm:text-7xl leading-[1.05]">
              More Than Jewellery.
              <br />
              A Brighter Tomorrow.
            </h1>
          </Reveal>

          <Reveal delayMs={300}>
            <div className="mt-12">
              <LuxuryButton href="/products" arrow variant="line" className="text-foreground">
                Explore Collection
              </LuxuryButton>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-14 w-px bg-gradient-to-b from-transparent via-border-strong to-transparent" />
      </section>

      {/* ============ 02 — BRAND STATEMENT ============ */}
      <section className="relative py-36 sm:py-48 text-center">
        <Reveal>
          <DiamondSparkle size={18} className="mx-auto mb-8" />
          <h2 className="font-display text-3xl sm:text-4xl">Crafted in Surat.</h2>
          <p className="mt-4 text-muted">Where precision meets brilliance.</p>
        </Reveal>
      </section>

      {/* ============ 03 — SURAT / DIAMOND STORY ============ */}
      <section id="story" className="relative scroll-mt-[100px] overflow-hidden bg-background-deep py-36 sm:py-48">
        <FloatingDiamonds className="opacity-70" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Reveal variant="scale">
            <SuratMap />
          </Reveal>

          <Reveal delayMs={200}>
            <p className="mt-4 eyebrow">Surat, India</p>
            <h2 className="mt-4 font-display text-4xl sm:text-6xl leading-[1.05]">
              The Diamond City
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-muted leading-relaxed">
              Nine out of every ten diamonds cut and polished worldwide pass through Surat&rsquo;s
              workshops. Dad of Diamonds was founded in that same city.
            </p>
            <p className="mt-8 font-display text-xl tracking-wide text-champagne">
              Cut with precision. Made to last.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ 04 — COLLECTIONS ============ */}
      <section aria-labelledby="collections-heading" className="py-32 sm:py-40">
        <Reveal className="mx-auto max-w-7xl px-6 text-center">
          <p className="eyebrow">The Collection</p>
          <h2 id="collections-heading" className="mt-4 font-display text-4xl sm:text-5xl">
            Shop by Category
          </h2>
        </Reveal>

        <Reveal delayMs={150} className="mx-auto mt-16 max-w-7xl px-6">
          <CollectionSelector categories={categories} />
        </Reveal>
      </section>

      {/* ============ 05 — FEATURED DIAMOND ============ */}
      {spotlightProduct && (
        <section aria-labelledby="spotlight-heading" className="border-t border-border py-32 sm:py-40">
          <h2 id="spotlight-heading" className="sr-only">
            Featured Piece
          </h2>
          <Reveal className="mx-auto max-w-7xl px-6">
            <ProductSpotlight product={spotlightProduct} />
          </Reveal>
        </section>
      )}

      {/* ============ 06 — CRAFTSMANSHIP ============ */}
      <section id="craft" className="relative scroll-mt-[100px] overflow-hidden bg-background-deep py-40 sm:py-56 text-center">
        <FacetLines />
        <Reveal className="relative mx-auto max-w-2xl px-6">
          <p className="font-display text-5xl sm:text-7xl leading-[1.05]">
            Precision
            <br />
            Is
            <br />
            <span className="text-champagne">Beauty.</span>
          </p>
          <p className="mx-auto mt-9 max-w-sm text-muted leading-relaxed">
            Every facet is cut, weighed, and set by hand — a discipline carried from Surat&rsquo;s
            workshops into every piece we make.
          </p>
        </Reveal>
      </section>

      {/* ============ 07 — PRODUCT COLLECTION ============ */}
      {remainingFeatured.length > 0 && (
        <section aria-labelledby="edit-heading" className="py-32 sm:py-40">
          <Reveal className="mx-auto max-w-7xl px-6">
            <p className="eyebrow">This Season</p>
            <h2 id="edit-heading" className="mt-4 font-display text-4xl sm:text-5xl">
              The Edit
            </h2>
          </Reveal>
          <Reveal delayMs={150} className="mx-auto mt-14 max-w-7xl px-6">
            <FeaturedCollection products={remainingFeatured} />
          </Reveal>
        </section>
      )}

      {/* ============ 08 — EDITORIAL QUOTE ============ */}
      <section className="border-y border-border py-36 sm:py-48 text-center">
        <Reveal className="mx-auto max-w-2xl px-6">
          <div className="rule-gold mx-auto mb-9" />
          <p className="font-display text-4xl sm:text-5xl leading-[1.15]">
            Brilliance
            <br />
            is in the
            <br />
            detail.
          </p>
        </Reveal>
      </section>

      {/* ============ 09 — FINAL CTA ============ */}
      <section className="relative overflow-hidden bg-background-deep py-36 sm:py-48 text-center">
        <Reveal className="relative mx-auto max-w-xl px-6">
          <h2 className="font-display text-4xl sm:text-6xl leading-[1.05]">
            Find Your
            <br />
            Brilliance.
          </h2>
          <div className="mt-10">
            <LuxuryButton href="/products" arrow variant="outline">
              Explore Collection
            </LuxuryButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function SuratMap() {
  return (
    <svg viewBox="0 0 400 200" className="mx-auto h-32 w-full max-w-md" aria-hidden="true">
      <g stroke="var(--border-strong)" strokeWidth="1" opacity="0.8">
        <line x1="200" y1="100" x2="30" y2="40" />
        <line x1="200" y1="100" x2="60" y2="170" />
        <line x1="200" y1="100" x2="370" y2="50" />
        <line x1="200" y1="100" x2="340" y2="160" />
        <line x1="200" y1="100" x2="200" y2="15" />
      </g>
      <circle cx="200" cy="100" r="16" fill="var(--accent)" opacity="0.12" />
      <circle cx="200" cy="100" r="4" fill="var(--accent)" />
      <text x="200" y="128" textAnchor="middle" fill="var(--muted)" fontSize="10" letterSpacing="2">
        SURAT
      </text>
    </svg>
  );
}

function FacetLines() {
  return (
    <svg
      viewBox="0 0 800 400"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
      preserveAspectRatio="xMidYMid slice"
    >
      <polygon points="400,60 520,160 470,340 330,340 280,160" fill="none" stroke="var(--champagne)" strokeWidth="1" />
      <path d="M400 60 L400 220 M280 160 L400 220 L520 160 M330 340 L400 220 L470 340" fill="none" stroke="var(--champagne)" strokeWidth="0.6" />
    </svg>
  );
}
