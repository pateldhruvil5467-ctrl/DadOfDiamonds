import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/category-card";
import { ProductCard } from "@/components/product-card";

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
      take: 8,
    }),
  ]);

  return (
    <>
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 text-center">
          <h1 className="font-display text-5xl sm:text-6xl tracking-wide">
            Diamonds, for everyone.
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-muted">
            Rings, earrings, chains, and bracelets crafted in fine diamonds — designed to be
            worn by anyone, every day.
          </p>
          <Link
            href="/products"
            className="mt-10 inline-block bg-foreground text-background px-8 py-3 text-sm tracking-widest uppercase hover:bg-accent transition-colors"
          >
            Shop the collection
          </Link>
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="mx-auto max-w-7xl px-6 py-20">
        <h2 id="categories-heading" className="font-display text-3xl text-center">
          Shop by Category
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section aria-labelledby="featured-heading" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 id="featured-heading" className="font-display text-3xl text-center">
            Featured Pieces
          </h2>

          {featuredProducts.length > 0 ? (
            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-center text-muted">New arrivals coming soon.</p>
          )}
        </div>
      </section>

      <section aria-labelledby="value-heading" className="mx-auto max-w-7xl px-6 py-20 text-center">
        <h2 id="value-heading" className="font-display text-3xl">
          Fine jewelry, honestly made
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-muted">
          Every piece is set with certified diamonds and finished by hand. No gimmicks, no
          markups for a brand name — just jewelry built to be worn and passed down.
        </p>
      </section>
    </>
  );
}
