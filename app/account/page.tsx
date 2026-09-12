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
    <div className="pt-[140px]">
      <div className="mx-auto max-w-3xl px-6 pb-24">
        <p className="eyebrow">Your Account</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">{user?.name ?? "Welcome"}</h1>
        <p className="mt-3 text-sm text-muted">{user?.email}</p>

        <div className="mt-16">
          <h2 className="eyebrow">Order History</h2>

          {orders.length === 0 ? (
            <p className="mt-6 text-muted">
              You haven&rsquo;t placed an order yet.{" "}
              <Link href="/products" className="link-reveal text-foreground">
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
                      <p className="text-sm group-hover:text-foreground transition-colors">{order.orderNumber}</p>
                      <p className="mt-1.5 text-xs text-muted">
                        {order.createdAt.toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" })}
                        {" · "}
                        {order.status} · {order.paymentStatus}
                      </p>
                    </div>
                    <p className="text-sm text-champagne">{formatMoney(order.total, order.currency)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link href="/products" className="link-reveal mt-16 inline-block text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}
