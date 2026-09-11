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
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <div className="text-center">
        <p className="eyebrow">The Collection</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">{heading}</h1>
        <p className="mt-4 text-sm text-muted">
          {products.length} {products.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      <nav aria-label="Filter by category" className="mt-10 flex flex-wrap justify-center gap-3">
        <FilterPill href="/products" active={!category} label="All" />
        {categories.map((c) => (
          <FilterPill key={c.id} href={`/products?category=${c.slug}`} active={category === c.slug} label={c.name} />
        ))}
      </nav>

      {products.length > 0 ? (
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-muted">No products found in this collection yet.</p>
      )}
    </div>
  );
}

function FilterPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`border px-5 py-2 text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${
        active ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted hover:border-accent hover:text-accent"
      }`}
    >
      {label}
    </Link>
  );
}
