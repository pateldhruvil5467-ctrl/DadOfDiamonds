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

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category ? { category: { slug: category } } : {}),
    },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
    orderBy: { createdAt: "desc" },
  });

  const heading = category ? (CATEGORY_NAMES[category] ?? "Products") : "All Jewelry";

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-4xl text-center">{heading}</h1>

      {products.length > 0 ? (
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted">No products found in this collection yet.</p>
      )}
    </div>
  );
}
