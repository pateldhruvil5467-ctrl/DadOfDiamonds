import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format-money";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/constants";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { StatCard } from "@/components/admin/stat-card";
import { OrderTable, type AdminOrderRow } from "@/components/admin/order-table";
import { ProductTable, type AdminProductRow } from "@/components/admin/product-table";

export default async function AdminDashboardPage() {
  const [totalProducts, activeProducts, lowStockProducts, totalOrders, pendingOrders, recentOrders, lowStockList] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          orderNumber: true,
          createdAt: true,
          total: true,
          currency: true,
          status: true,
          paymentStatus: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
        orderBy: { stock: "asc" },
        take: 5,
        select: {
          name: true,
          sku: true,
          stock: true,
          isActive: true,
          category: { select: { name: true } },
        },
      }),
    ]);

  // Decimal→string conversion happens here, at the data boundary — components downstream only
  // ever receive plain strings, never a Prisma Decimal.
  const orderRows: AdminOrderRow[] = recentOrders.map((order) => ({
    orderNumber: order.orderNumber ?? "—",
    dateLabel: order.createdAt.toLocaleDateString("en-IE", { year: "numeric", month: "short", day: "numeric" }),
    customerLabel: order.user.name ?? order.user.email,
    totalLabel: formatMoney(order.total, order.currency),
    status: order.status,
    paymentStatus: order.paymentStatus,
  }));

  const lowStockRows: AdminProductRow[] = lowStockList.map((product) => ({
    name: product.name,
    sku: product.sku,
    categoryName: product.category.name,
    stock: product.stock,
    isActive: product.isActive,
  }));

  return (
    <div>
      <AdminPageHeading title="Dashboard" description="Store performance at a glance." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Products" value={totalProducts} />
        <StatCard label="Active Products" value={activeProducts} />
        <StatCard label="Low Stock" value={lowStockProducts} tone={lowStockProducts > 0 ? "accent" : "neutral"} />
        <StatCard label="Total Orders" value={totalOrders} />
      </div>

      {pendingOrders > 0 && (
        <div className="mt-4">
          <StatCard label="Pending Orders" value={pendingOrders} tone="accent" />
        </div>
      )}

      <section className="mt-12">
        <h2 className="mb-4 text-xs uppercase tracking-[0.18em] text-muted">Recent Orders</h2>
        <OrderTable orders={orderRows} emptyMessage="No orders yet." />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-xs uppercase tracking-[0.18em] text-muted">
          Low Stock ({LOW_STOCK_THRESHOLD} units or fewer)
        </h2>
        <ProductTable products={lowStockRows} emptyMessage="No products are currently low on stock." />
      </section>
    </div>
  );
}
