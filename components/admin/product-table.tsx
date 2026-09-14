import Link from "next/link";
import { StatusBadge, ProductStateBadge } from "@/components/admin/status-badge";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/constants";

export type AdminProductRow = {
  id?: string;
  name: string;
  sku: string;
  categoryName: string;
  stock: number;
  isActive: boolean;
  isFeatured?: boolean;
  priceLabel?: string;
};

function StockLabel({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-foreground">{stock}</span>
        <StatusBadge label="Out of Stock" tone="danger" />
      </span>
    );
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-foreground">{stock}</span>
        <StatusBadge label="Low Stock" tone="accent" />
      </span>
    );
  }
  return <span className="text-foreground">{stock}</span>;
}

function ProductName({ product }: { product: AdminProductRow }) {
  const label = (
    <span className="flex items-center gap-2">
      {product.name}
      {product.isFeatured && <StatusBadge label="Featured" tone="accent" />}
    </span>
  );
  if (!product.id) return label;
  return (
    <Link href={`/admin/products/${product.id}`} className="link-reveal hover:text-accent transition-colors">
      {label}
    </Link>
  );
}

// Same responsive table→cards pattern as OrderTable — see that file's comment. `variant="full"`
// (the /admin/products management list) adds a Price column and an explicit Edit action; the
// default "compact" variant (the dashboard's low-stock preview) stays exactly as it was.
export function ProductTable({
  products,
  emptyMessage,
  variant = "compact",
}: {
  products: AdminProductRow[];
  emptyMessage: string;
  variant?: "compact" | "full";
}) {
  if (products.length === 0) {
    return <p className="border border-border bg-background-deep px-5 py-10 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="border border-border bg-background-deep">
      <table className="hidden w-full text-left text-sm md:table">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted">
            <th scope="col" className="px-5 py-3 font-normal">Product</th>
            <th scope="col" className="px-5 py-3 font-normal">SKU</th>
            <th scope="col" className="px-5 py-3 font-normal">Category</th>
            {variant === "full" && <th scope="col" className="px-5 py-3 font-normal">Price</th>}
            <th scope="col" className="px-5 py-3 font-normal">Stock</th>
            <th scope="col" className="px-5 py-3 font-normal">State</th>
            {variant === "full" && <th scope="col" className="px-5 py-3 font-normal text-right">Action</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.sku} className="border-b border-border last:border-none">
              <td className="px-5 py-4 text-foreground">
                <ProductName product={product} />
              </td>
              <td className="px-5 py-4 text-muted">{product.sku}</td>
              <td className="px-5 py-4 text-muted">{product.categoryName}</td>
              {variant === "full" && <td className="px-5 py-4 text-champagne">{product.priceLabel}</td>}
              <td className="px-5 py-4"><StockLabel stock={product.stock} /></td>
              <td className="px-5 py-4"><ProductStateBadge isActive={product.isActive} /></td>
              {variant === "full" && (
                <td className="px-5 py-4 text-right">
                  {product.id && (
                    <Link href={`/admin/products/${product.id}`} className="link-reveal text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors">
                      Edit →
                    </Link>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="md:hidden">
        {products.map((product) => (
          <li key={product.sku} className="border-b border-border px-5 py-4 last:border-none">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-foreground">
                <ProductName product={product} />
              </p>
              <ProductStateBadge isActive={product.isActive} />
            </div>
            <p className="mt-1 text-xs text-muted">
              {product.sku} · {product.categoryName}
              {variant === "full" && product.priceLabel ? ` · ${product.priceLabel}` : ""}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <StockLabel stock={product.stock} />
              {variant === "full" && product.id && (
                <Link href={`/admin/products/${product.id}`} className="link-reveal text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors">
                  Edit →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
