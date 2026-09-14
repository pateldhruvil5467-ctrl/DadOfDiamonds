import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format-money";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { ProductTable, type AdminProductRow } from "@/components/admin/product-table";
import { LuxuryButton } from "@/components/luxury-button";

type SearchParams = { q?: string; category?: string; status?: string };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, category, status } = await searchParams;

  const where: Prisma.ProductWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(status === "active" ? { isActive: true } : status === "inactive" ? { isActive: false } : {}),
  };

  // Server-side filtering via searchParams — the full catalog is never fetched into a client
  // component; this Server Component queries only the rows the current filter actually matches.
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { stock: "asc" }],
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        isActive: true,
        isFeatured: true,
        price: true,
        currency: true,
        category: { select: { name: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
  ]);

  const rows: AdminProductRow[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    categoryName: product.category.name,
    stock: product.stock,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    priceLabel: formatMoney(product.price, product.currency),
  }));

  const hasFilters = Boolean(q || category || status);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <AdminPageHeading
          title="Products"
          description={`${products.length} product${products.length === 1 ? "" : "s"}${hasFilters ? " matching this filter" : " in the catalog"}.`}
        />
        <LuxuryButton href="/admin/products/new" variant="outline" arrow className="shrink-0">
          New Product
        </LuxuryButton>
      </div>

      <form method="get" className="mb-8 flex flex-wrap items-end gap-5 border-y border-border py-5">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted">
          <span>Search</span>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Name, SKU, or slug"
            className="field-underline w-56"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted">
          <span>Category</span>
          <select name="category" defaultValue={category ?? ""} className="field-underline w-48">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.15em] text-muted">
          <span>State</span>
          <select name="status" defaultValue={status ?? ""} className="field-underline w-40">
            <option value="">All states</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <button type="submit" className="link-reveal text-xs uppercase tracking-[0.15em] text-foreground hover:text-accent transition-colors">
          Filter
        </button>
        {hasFilters && (
          <Link href="/admin/products" className="link-reveal text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors">
            Clear
          </Link>
        )}
      </form>

      <ProductTable products={rows} emptyMessage="No products match this filter." variant="full" />
    </div>
  );
}
