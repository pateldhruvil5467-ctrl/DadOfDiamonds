import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format-money";
import { AddToCartForm } from "@/components/add-to-cart-form";

export const revalidate = 60;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const image = product.images[0];
  const stockLabel =
    product.stock <= 0 ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock";

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <Link href="/products" className="link-reveal text-sm text-muted hover:text-accent transition-colors">
        ← Back to all jewelry
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square border border-border bg-surface flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--accent-soft)_0%,transparent_70%)] opacity-20" />
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.name}
              width={560}
              height={560}
              priority
              className="relative h-full w-full object-contain p-16"
            />
          ) : (
            <span className="relative text-xs text-muted">No image</span>
          )}
        </div>

        <div className="lg:sticky lg:top-[130px] lg:self-start">
          <Link
            href={`/products?category=${product.category.slug}`}
            className="eyebrow hover:text-foreground transition-colors"
          >
            {product.category.name}
          </Link>

          <h1 className="mt-3 font-display text-4xl sm:text-5xl leading-tight">{product.name}</h1>
          <p className="mt-5 text-2xl text-accent">{formatMoney(product.price, product.currency)}</p>

          <p className={`mt-3 text-sm ${product.stock <= 0 ? "text-muted" : "text-accent"}`} role="status">
            {stockLabel}
          </p>

          <p className="mt-7 text-muted leading-relaxed">{product.description}</p>
          <p className="mt-4 text-sm text-muted">Material: {product.material}</p>

          <div className="mt-9 border-t border-border pt-9">
            <AddToCartForm
              productId={product.id}
              slug={product.slug}
              name={product.name}
              price={Number(product.price)}
              currency={product.currency}
              image={image?.url}
              stock={product.stock}
            />
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 text-xs uppercase tracking-[0.15em] text-muted">
            <div>
              <dt className="text-foreground">Delivery</dt>
              <dd className="mt-1">Worldwide, securely packed</dd>
            </div>
            <div>
              <dt className="text-foreground">Packaging</dt>
              <dd className="mt-1">Presented with care</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
