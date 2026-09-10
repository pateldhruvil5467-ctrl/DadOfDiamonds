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
      <div className="aspect-square bg-surface border border-border flex items-center justify-center overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            width={320}
            height={320}
            className="h-full w-full object-contain p-10 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-xs text-muted">No image</span>
        )}
      </div>
      <h3 className="mt-4 text-sm">{product.name}</h3>
      <p className="mt-1 text-sm text-muted">{formatMoney(product.price, product.currency)}</p>
    </Link>
  );
}
