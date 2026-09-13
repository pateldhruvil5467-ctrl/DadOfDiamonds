import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format-money";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { OrderTable, type AdminOrderRow } from "@/components/admin/order-table";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      createdAt: true,
      total: true,
      currency: true,
      status: true,
      paymentStatus: true,
      user: { select: { name: true, email: true } },
    },
  });

  const rows: AdminOrderRow[] = orders.map((order) => ({
    orderNumber: order.orderNumber ?? "—",
    dateLabel: order.createdAt.toLocaleDateString("en-IE", { year: "numeric", month: "short", day: "numeric" }),
    customerLabel: order.user.name ?? order.user.email,
    totalLabel: formatMoney(order.total, order.currency),
    status: order.status,
    paymentStatus: order.paymentStatus,
  }));

  return (
    <div>
      <AdminPageHeading
        title="Orders"
        description={`${orders.length} order${orders.length === 1 ? "" : "s"} placed.`}
      />
      <OrderTable orders={rows} emptyMessage="No orders have been placed yet." />
    </div>
  );
}
