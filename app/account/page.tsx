import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/format-money";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/account")}`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true, status: true, paymentStatus: true, total: true, currency: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <p className="eyebrow">Your Account</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{user?.name ?? "Welcome"}</h1>
      <p className="mt-2 text-sm text-muted">{user?.email}</p>

      <div className="mt-14">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Order History</h2>

        {orders.length === 0 ? (
          <p className="mt-6 text-muted">
            You haven&rsquo;t placed an order yet.{" "}
            <Link href="/products" className="link-reveal text-accent">
              Explore the collection
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 flex flex-col">
            {orders.map((order) => (
              <li key={order.orderNumber} className="border-b border-border py-5">
                <Link href={`/orders/${order.orderNumber}`} className="flex flex-wrap items-center justify-between gap-3 group">
                  <div>
                    <p className="text-sm group-hover:text-accent transition-colors">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-muted">
                      {order.createdAt.toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" })}
                      {" · "}
                      {order.status} · {order.paymentStatus}
                    </p>
                  </div>
                  <p className="text-sm">{formatMoney(order.total, order.currency)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/products" className="mt-14 inline-block link-reveal text-sm uppercase tracking-[0.18em] text-muted hover:text-accent transition-colors">
        ← Continue Shopping
      </Link>
    </div>
  );
}
