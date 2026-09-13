import type { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";

export type AdminOrderRow = {
  orderNumber: string;
  dateLabel: string;
  customerLabel: string;
  totalLabel: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
};

// Renders as a real <table> at md+ and as stacked cards below md — avoids forcing horizontal
// scroll on the admin's mobile presentation while keeping a dense, scannable table on desktop.
export function OrderTable({ orders, emptyMessage }: { orders: AdminOrderRow[]; emptyMessage: string }) {
  if (orders.length === 0) {
    return <p className="border border-border bg-background-deep px-5 py-10 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="border border-border bg-background-deep">
      {/* Desktop / tablet table */}
      <table className="hidden w-full text-left text-sm md:table">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-[0.12em] text-muted">
            <th scope="col" className="px-5 py-3 font-normal">Order</th>
            <th scope="col" className="px-5 py-3 font-normal">Date</th>
            <th scope="col" className="px-5 py-3 font-normal">Customer</th>
            <th scope="col" className="px-5 py-3 font-normal">Status</th>
            <th scope="col" className="px-5 py-3 font-normal">Payment</th>
            <th scope="col" className="px-5 py-3 text-right font-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderNumber} className="border-b border-border last:border-none">
              <td className="px-5 py-4 text-foreground">{order.orderNumber}</td>
              <td className="px-5 py-4 text-muted">{order.dateLabel}</td>
              <td className="px-5 py-4 text-muted">{order.customerLabel}</td>
              <td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td>
              <td className="px-5 py-4"><PaymentStatusBadge status={order.paymentStatus} /></td>
              <td className="px-5 py-4 text-right text-champagne">{order.totalLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile stacked cards */}
      <ul className="md:hidden">
        {orders.map((order) => (
          <li key={order.orderNumber} className="border-b border-border px-5 py-4 last:border-none">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-foreground">{order.orderNumber}</p>
              <p className="text-sm text-champagne">{order.totalLabel}</p>
            </div>
            <p className="mt-1 text-xs text-muted">{order.dateLabel} · {order.customerLabel}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
