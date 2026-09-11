import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/format-money";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { images: true; category: true };
}>;

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = product.images[0];

  return (
    <Link href={`/products/${product.slug}`} className="group block" aria-label={product.name}>
      <div className="relative aspect-square overflow-hidden border border-border bg-surface transition-colors duration-500 group-hover:border-accent">
        {/* Soft gold glow that appears on hover, behind the product */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,var(--accent-soft)_0%,transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-25" />
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            width={320}
            height={320}
            className="relative h-full w-full object-contain p-10 transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-[1.06]"
          />
        ) : (
          <span className="relative flex h-full items-center justify-center text-xs text-muted">No image</span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-px bg-accent scale-x-0 origin-left transition-transform duration-500 ease-[var(--ease-luxury)] group-hover:scale-x-100" />
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{product.category.name}</p>
          <h3 className="mt-1 font-display text-lg leading-snug">{product.name}</h3>
        </div>
      </div>
      <p className="mt-1 text-sm text-accent">{formatMoney(product.price, product.currency)}</p>
    </Link>
  );
}
