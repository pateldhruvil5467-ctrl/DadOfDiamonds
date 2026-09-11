import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/category-card";
import { FeaturedCollection } from "@/components/featured-collection";
import { SectionHeading } from "@/components/section-heading";
import { LuxuryButton } from "@/components/luxury-button";
import { FloatingDiamonds } from "@/components/floating-diamonds";
import { DiamondSparkle } from "@/components/diamond-sparkle";

// Without this, Next.js would statically prerender this page once at build time — future
// product/category edits (admin dashboard, later phase) wouldn't appear until the next
// deploy. Revalidating every 60s keeps it cheap while staying reasonably fresh.
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

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden border-b border-border">
        <FloatingDiamonds />

        {/* Large, extremely slow-rotating faceted diamond as a cinematic backdrop element */}
        <svg
          viewBox="0 0 200 200"
          aria-hidden="true"
          className="motion-safe:animate-spin-slow pointer-events-none absolute right-[-10%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 opacity-[0.07] sm:right-[-5%] lg:right-[5%]"
        >
          <polygon points="100,10 175,60 145,190 55,190 25,60" fill="none" stroke="var(--accent)" strokeWidth="1" />
          <path d="M100 10 L100 95 M25 60 L100 95 L175 60 M55 190 L100 95 L145 190" fill="none" stroke="var(--accent)" strokeWidth="0.75" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center sm:text-left">
          <p className="eyebrow flex items-center justify-center gap-2 sm:justify-start">
            <DiamondSparkle size={12} />
            From Surat to the World
          </p>

          <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl max-w-3xl">
            More Than Jewellery.
            <br />
            <span className="text-accent">A Brighter Tomorrow.</span>
          </h1>

          <p className="mt-7 max-w-lg text-muted leading-relaxed mx-auto sm:mx-0">
            Born in Surat, shaped by generations of diamond craftsmanship — Dad of Diamonds
            brings that precision to rings, earrings, necklaces, and bracelets made for anyone,
            every day.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center justify-center sm:justify-start">
            <LuxuryButton href="/products" arrow>
              Explore Collection
            </LuxuryButton>
            <LuxuryButton href="/#story" variant="outline">
              Our Story
            </LuxuryButton>
          </div>
        </div>
      </section>

      {/* ================= VALUE STRIP ================= */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 sm:grid-cols-3 text-center">
          {[
            { title: "Precision Cut", body: "Every facet shaped with the discipline of Surat's diamond workshops." },
            { title: "Made For Everyone", body: "Unisex designs built to be worn daily, not saved for occasions." },
            { title: "Honest Pricing", body: "Fine diamonds without an inflated brand-name markup." },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="font-display text-xl">{item.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SHOP BY CATEGORY ================= */}
      <section aria-labelledby="categories-heading" className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading id="categories-heading" eyebrow="The Collection" heading="Shop by Category" />

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {categories.map((category, i) => (
            <div key={category.id} className={i === 0 ? "sm:col-span-2" : ""}>
              <CategoryCard category={category} size={i === 0 ? "large" : "small"} />
            </div>
          ))}
        </div>
      </section>

      {/* ================= SURAT STORY ================= */}
      <section
        id="story"
        className="relative scroll-mt-[73px] md:scroll-mt-[114px] overflow-hidden border-y border-border bg-surface py-28"
      >
        <FloatingDiamonds className="opacity-70" />
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 500"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="500" cy="250" r="3" fill="var(--accent)" />
          {[
            [500, 250, 120, 90],
            [500, 250, 260, 150],
            [500, 250, 400, 40],
            [500, 250, 200, 380],
            [500, 250, 780, 340],
            [500, 250, 850, 120],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeWidth="1" />
          ))}
        </svg>

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <SectionHeading
            eyebrow="Surat, India"
            heading={
              <>
                Crafted in Surat.
                <br />
                Made for the World.
              </>
            }
            supporting="Nine out of every ten diamonds cut and polished worldwide pass through Surat's
              workshops. Dad of Diamonds was founded in that same city — carrying its discipline
              of precision into jewelry meant to be worn, not just admired."
          />
        </div>
      </section>

      {/* ================= FEATURED COLLECTION ================= */}
      {featuredProducts.length > 0 && (
        <section aria-labelledby="featured-heading" className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeading id="featured-heading" eyebrow="Featured" heading="This Season's Edit" align="left" />
          <div className="mt-14">
            <FeaturedCollection products={featuredProducts} />
          </div>
        </section>
      )}

      {/* ================= EDITORIAL QUOTE ================= */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <DiamondSparkle size={20} className="mx-auto mb-6" />
          <p className="font-display text-3xl sm:text-4xl leading-snug">
            &ldquo;In Surat, precision is inherited — passed from hand to hand for generations.
            Dad of Diamonds carries that same care into every piece.&rdquo;
          </p>
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 sm:grid-cols-3 text-center">
          {[
            { title: "Crafted with Precision", body: "Every piece finished to a fine, exacting standard." },
            { title: "Thoughtful Packaging", body: "Presented the way a diamond deserves to arrive." },
            { title: "Worldwide Delivery", body: "Shipped securely, wherever you call home." },
          ].map((item) => (
            <div key={item.title} className="border border-border bg-surface p-8">
              <h3 className="font-display text-lg">{item.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative overflow-hidden border-t border-border bg-surface py-24 text-center">
        <FloatingDiamonds />
        <div className="relative mx-auto max-w-2xl px-6">
          <h2 className="font-display text-4xl sm:text-5xl">Ready to find your piece?</h2>
          <p className="mt-5 text-muted">Rings, earrings, necklaces, and bracelets — crafted for anyone, every day.</p>
          <div className="mt-9">
            <LuxuryButton href="/products" arrow>
              Shop the Collection
            </LuxuryButton>
          </div>
        </div>
      </section>
    </>
  );
}
