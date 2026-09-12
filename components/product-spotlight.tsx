import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/format-money";

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { images: true; category: true };
}>;

/**
 * A single product presented as an advertisement, not a catalogue entry — large dominant
 * imagery, small editorial metadata positioned asymmetrically beside it. Used once per
 * homepage, never repeated as a grid pattern.
 */
export function ProductSpotlight({ product }: { product: ProductWithRelations }) {
  const image = product.images[0];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-0">
      <div className="relative aspect-[4/3] lg:aspect-[16/11] bg-surface">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            width={720}
            height={540}
            priority
            className="h-full w-full object-contain p-16 lg:p-24"
          />
        ) : null}
      </div>

      <div className="lg:pl-14">
        <p className="text-[11px] tracking-[0.3em] text-muted">01 / SIGNATURE COLLECTION</p>
        <h3 className="mt-5 font-display text-4xl sm:text-5xl leading-[1.05]">{product.name}</h3>
        <p className="mt-5 text-2xl text-champagne">{formatMoney(product.price, product.currency)}</p>
        <p className="mt-6 max-w-sm text-muted leading-relaxed">{product.description}</p>
        <Link
          href={`/products/${product.slug}`}
          className="group mt-8 inline-flex items-center gap-3 text-xs uppercase tracking-[0.22em] link-reveal"
        >
          Discover Piece
          <svg viewBox="0 0 16 10" width="16" height="10" aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">
            <path d="M0 5h14M9 1l4.5 4L9 9" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
