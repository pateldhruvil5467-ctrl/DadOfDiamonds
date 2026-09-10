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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/products" className="text-sm text-muted hover:text-accent transition-colors">
        ← Back to all jewelry
      </Link>

      <div className="mt-8 grid gap-12 sm:grid-cols-2">
        <div className="aspect-square bg-surface border border-border flex items-center justify-center">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.name}
              width={480}
              height={480}
              priority
              className="h-full w-full object-contain p-16"
            />
          ) : (
            <span className="text-xs text-muted">No image</span>
          )}
        </div>

        <div>
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-xs uppercase tracking-widest text-muted hover:text-accent transition-colors"
          >
            {product.category.name}
          </Link>

          <h1 className="mt-2 font-display text-4xl">{product.name}</h1>
          <p className="mt-4 text-xl">{formatMoney(product.price, product.currency)}</p>

          <p
            className={`mt-2 text-sm ${product.stock <= 0 ? "text-muted" : "text-accent"}`}
            role="status"
          >
            {stockLabel}
          </p>

          <p className="mt-6 text-muted leading-relaxed">{product.description}</p>
          <p className="mt-4 text-sm text-muted">Material: {product.material}</p>

          <div className="mt-8">
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
        </div>
      </div>
    </div>
  );
}
