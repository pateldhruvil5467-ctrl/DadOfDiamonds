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
      <div className="relative aspect-[3/4] overflow-hidden bg-surface shimmer-sweep">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            width={360}
            height={480}
            className="h-full w-full object-contain p-12 transition-transform duration-[1200ms] ease-[var(--ease-luxury)] group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-muted">No image</span>
        )}

        {/* Glint on hover — a one-shot reveal via CSS transition, not a looping animation */}
        <span className="absolute right-5 top-5 opacity-0 scale-50 -rotate-45 transition-all duration-500 ease-[var(--ease-luxury)] group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="var(--champagne)" />
          </svg>
        </span>
      </div>

      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted">{product.category.name}</p>
        <h3 className="mt-1.5 font-display text-lg leading-snug">{product.name}</h3>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="text-sm text-champagne">{formatMoney(product.price, product.currency)}</p>
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted opacity-0 transition-all duration-500 ease-[var(--ease-luxury)] group-hover:opacity-100">
            View Piece
            <svg viewBox="0 0 16 10" width="14" height="9" aria-hidden="true" className="-translate-x-1 transition-transform duration-500 ease-[var(--ease-luxury)] group-hover:translate-x-0">
              <path d="M0 5h14M9 1l4.5 4L9 9" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
