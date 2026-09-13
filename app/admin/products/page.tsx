import { prisma } from "@/lib/prisma";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { ProductTable, type AdminProductRow } from "@/components/admin/product-table";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ isActive: "desc" }, { stock: "asc" }],
    select: {
      name: true,
      sku: true,
      stock: true,
      isActive: true,
      category: { select: { name: true } },
    },
  });

  const rows: AdminProductRow[] = products.map((product) => ({
    name: product.name,
    sku: product.sku,
    categoryName: product.category.name,
    stock: product.stock,
    isActive: product.isActive,
  }));

  return (
    <div>
      <AdminPageHeading
        title="Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"} in the catalog.`}
      />
      <ProductTable products={rows} emptyMessage="No products have been added yet." />
    </div>
  );
}
