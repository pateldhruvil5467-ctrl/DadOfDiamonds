import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/format-money";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { images: true; category: true };
}>;

/**
 * Editorial asymmetric layout: one large piece beside two smaller ones, rather than a uniform
 * card grid — meant to read like a jewelry campaign spread. Falls back to a simple row if
 * fewer than 3 products are available.
 */
export function FeaturedCollection({ products }: { products: ProductWithRelations[] }) {
  if (products.length === 0) return null;

  if (products.length < 3) {
    return (
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        {products.map((product) => (
          <EditorialTile key={product.id} product={product} />
        ))}
      </div>
    );
  }

  const [feature, ...rest] = products;
  const sideProducts = rest.slice(0, 2);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <EditorialTile product={feature} large />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
        {sideProducts.map((product) => (
          <EditorialTile key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function EditorialTile({ product, large = false }: { product: ProductWithRelations; large?: boolean }) {
  const image = product.images[0];
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group relative block overflow-hidden bg-surface ${
        large ? "aspect-square lg:aspect-auto lg:h-full min-h-[320px]" : "aspect-[4/3] sm:aspect-square lg:aspect-[4/3]"
      }`}
    >
      {image ? (
        <Image
          src={image.url}
          alt={image.altText ?? product.name}
          width={large ? 480 : 320}
          height={large ? 480 : 320}
          className={`h-full w-full object-contain transition-transform duration-[1200ms] ease-[var(--ease-luxury)] group-hover:scale-[1.05] ${large ? "p-16" : "p-10"}`}
        />
      ) : (
        <span className="flex h-full items-center justify-center text-xs text-muted">No image</span>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/50 to-transparent p-6">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted">{product.category.name}</p>
        <h3 className={`mt-1 font-display ${large ? "text-3xl" : "text-xl"}`}>{product.name}</h3>
        <p className="mt-1 text-sm text-champagne">{formatMoney(product.price, product.currency)}</p>
      </div>
    </Link>
  );
}
