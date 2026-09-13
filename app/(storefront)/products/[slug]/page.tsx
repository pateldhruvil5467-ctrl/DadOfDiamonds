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
    <div className="pt-[100px]">
      <div className="mx-auto max-w-7xl px-6 pb-24">
        <Link href="/products" className="link-reveal text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors">
          ← Back to all jewelry
        </Link>

        <div className="mt-10 grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div className="relative aspect-[4/3] lg:aspect-[16/13] bg-surface">
            {image ? (
              <Image
                src={image.url}
                alt={image.altText ?? product.name}
                width={720}
                height={600}
                priority
                className="h-full w-full object-contain p-16 lg:p-24"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-xs text-muted">No image</span>
            )}
          </div>

          <div className="lg:sticky lg:top-[130px] lg:self-start">
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-[11px] uppercase tracking-[0.28em] text-muted hover:text-foreground transition-colors"
            >
              {product.category.name}
            </Link>

            <h1 className="mt-4 font-display text-4xl sm:text-5xl leading-[1.05]">{product.name}</h1>
            <p className="mt-6 text-2xl text-champagne">{formatMoney(product.price, product.currency)}</p>

            <p className={`mt-4 text-xs uppercase tracking-[0.2em] ${product.stock <= 0 ? "text-muted" : "text-accent"}`} role="status">
              {stockLabel}
            </p>

            <p className="mt-8 text-muted leading-relaxed max-w-md">{product.description}</p>
            <p className="mt-5 text-sm text-muted">Material — {product.material}</p>

            <div className="mt-10 border-t border-border pt-10">
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

            <div className="mt-10 grid grid-cols-1 gap-6 border-t border-border pt-8 text-[11px] uppercase tracking-[0.2em] text-muted sm:grid-cols-3">
              <div>
                <p className="text-foreground">Crafted in Surat</p>
                <p className="mt-1.5 normal-case tracking-normal">India&rsquo;s diamond-cutting capital</p>
              </div>
              <div>
                <p className="text-foreground">Complimentary Delivery</p>
                <p className="mt-1.5 normal-case tracking-normal">Worldwide, securely packed</p>
              </div>
              <div>
                <p className="text-foreground">Secure Checkout</p>
                <p className="mt-1.5 normal-case tracking-normal">Verified and encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
