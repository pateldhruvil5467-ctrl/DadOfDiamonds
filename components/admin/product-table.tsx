import { StatusBadge, ProductStateBadge } from "@/components/admin/status-badge";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/constants";

export type AdminProductRow = {
  name: string;
  sku: string;
  categoryName: string;
  stock: number;
  isActive: boolean;
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

// Same responsive table→cards pattern as OrderTable — see that file's comment.
export function ProductTable({ products, emptyMessage }: { products: AdminProductRow[]; emptyMessage: string }) {
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
            <th scope="col" className="px-5 py-3 font-normal">Stock</th>
            <th scope="col" className="px-5 py-3 font-normal">State</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.sku} className="border-b border-border last:border-none">
              <td className="px-5 py-4 text-foreground">{product.name}</td>
              <td className="px-5 py-4 text-muted">{product.sku}</td>
              <td className="px-5 py-4 text-muted">{product.categoryName}</td>
              <td className="px-5 py-4"><StockLabel stock={product.stock} /></td>
              <td className="px-5 py-4"><ProductStateBadge isActive={product.isActive} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="md:hidden">
        {products.map((product) => (
          <li key={product.sku} className="border-b border-border px-5 py-4 last:border-none">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-foreground">{product.name}</p>
              <ProductStateBadge isActive={product.isActive} />
            </div>
            <p className="mt-1 text-xs text-muted">{product.sku} · {product.categoryName}</p>
            <div className="mt-2">
              <StockLabel stock={product.stock} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
