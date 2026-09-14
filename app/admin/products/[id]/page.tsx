import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { ProductForm } from "@/components/admin/product-form";
import { ProductActivationToggle } from "@/components/admin/product-activation-toggle";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) {
    notFound();
  }

  // Decimal → plain number happens here, at the query boundary, before anything crosses into
  // the client ProductForm component — it never receives a Prisma.Decimal.
  const initialValues = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toNumber(),
    compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toNumber() : undefined,
    categoryId: product.categoryId,
    material: product.material,
    sku: product.sku,
    stock: product.stock,
    isFeatured: product.isFeatured,
    isUnisex: product.isUnisex,
    images: product.images.map((image) => ({ url: image.url, altText: image.altText ?? "" })),
  };

  return (
    <div>
      <AdminPageHeading title={product.name} description={`SKU ${product.sku}`} />
      <ProductActivationToggle productId={product.id} isActive={product.isActive} />
      <ProductForm mode="edit" productId={product.id} categories={categories} initialValues={initialValues} />
    </div>
  );
}
