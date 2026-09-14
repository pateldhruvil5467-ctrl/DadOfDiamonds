import { prisma } from "@/lib/prisma";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { ProductForm } from "@/components/admin/product-form";

// Read-only rendering — authorization for this whole subtree is already enforced by
// app/admin/layout.tsx's requireAdmin() call. Only the mutation the form submits to
// (POST /api/admin/products) re-checks requireAdmin() independently, since that is the actual
// security boundary for the write itself.
export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <AdminPageHeading title="New Product" description="Add a piece to the catalog." />
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
