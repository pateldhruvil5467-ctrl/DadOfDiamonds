import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

const CATEGORY_NAMES: Record<string, string> = {
  rings: "Rings",
  earrings: "Earrings",
  "chains-necklaces": "Chains & Necklaces",
  bracelets: "Bracelets",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(category ? { category: { slug: category } } : {}),
      },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const heading = category ? (CATEGORY_NAMES[category] ?? "Products") : "All Jewelry";

  return (
    <div className="pt-[110px]">
      <div className="mx-auto max-w-7xl px-6 pb-24">
        <div className="text-center">
          <p className="eyebrow">The Collection</p>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl">{heading}</h1>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
            {products.length} {products.length === 1 ? "Piece" : "Pieces"}
          </p>
        </div>

        <nav aria-label="Filter by category" className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 border-y border-border py-5">
          <FilterLink href="/products" active={!category} label="All" />
          {categories.map((c) => (
            <FilterLink key={c.id} href={`/products?category=${c.slug}`} active={category === c.slug} label={c.name} />
          ))}
        </nav>

        {products.length > 0 ? (
          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-20 text-center text-muted">No products found in this collection yet.</p>
        )}
      </div>
    </div>
  );
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`link-reveal text-xs uppercase tracking-[0.18em] transition-colors ${
        active ? "text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
